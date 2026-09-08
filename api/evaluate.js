// Vercel Serverless Function: /api/evaluate
// Allows GradeCrow to evaluate papers using the owner's server-side GEMINI_API_KEY securely.

let cachedServerModels = null;

async function getServerModels(serverApiKey) {
  if (cachedServerModels && cachedServerModels.length > 0) return cachedServerModels;
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${serverApiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const valid = (listData.models || [])
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(m => !m.includes('embedding') && !m.includes('aqa') && !m.includes('imagen') && !m.includes('tts') && !m.includes('text-bison'));

      const flash = valid.filter(m => m.includes('flash'));
      const pro = valid.filter(m => m.includes('pro') && !m.includes('flash'));
      const rest = valid.filter(m => !m.includes('flash') && !m.includes('pro'));

      const sorted = [...flash, ...pro, ...rest];
      if (sorted.length > 0) {
        cachedServerModels = sorted;
        return sorted;
      }
    }
  } catch (e) {
    console.warn('Server model discovery failed:', e);
  }
  return ['gemini-2.5-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const serverApiKey = process.env.GEMINI_API_KEY;
  if (!serverApiKey) {
    return res.status(503).json({ 
      error: 'NO_SERVER_KEY', 
      message: 'No server GEMINI_API_KEY configured in Vercel environment variables.' 
    });
  }

  try {
    const { imageBase64, pagesBase64, mimeType = 'image/jpeg', rubric } = req.body || {};

    if ((!imageBase64 && (!pagesBase64 || pagesBase64.length === 0)) || !rubric) {
      return res.status(400).json({ error: 'Missing imageBase64 / pagesBase64 or rubric data.' });
    }

    // Build array of clean base64 image strings for multi-page submissions
    const rawPages = Array.isArray(pagesBase64) && pagesBase64.length > 0 
      ? pagesBase64 
      : [imageBase64];

    const cleanPages = rawPages.map(img => 
      img.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').replace(/[\r\n\s]+/g, '')
    );

    const prompt = `You are GradeCrow AI, an expert exam evaluation assistant (gradecrow.com).
Look at the attached student handwritten exam paper image(s) (${cleanPages.length} page(s) attached).

1. OCR TRANSCRIPTION & MATH/DIAGRAM HANDLING:
   - Transcribe all handwritten text, math equations, derivations, and diagram labels across ALL pages.
   - Convert all mathematical formulas, fractions, integrals, and equations into standard LaTeX notation (e.g. $$E=mc^2$$ or $$\\frac{a}{b}$$).
   - Evaluate step-by-step mathematical reasoning. Award partial marks if method/formula application is correct even if final numerical calculation has minor arithmetic errors.
   - For diagrams/visual answers, evaluate structural accuracy and presence of required labels.

2. EVALUATION & SCORING RULES:
   - "hit" (Full Marks = 100% of weight): Student provides correct heading/concept AND adequate detailed explanation or working.
   - "partial" (Partial Marks = 50% of weight): Student writes correct heading, concept title, correct formula/method, or key terminology, even if working is incomplete. DO NOT award 0 marks if the correct concept/heading/formula is present!
   - "missed" (0 Marks): Topic, formula, or concept is completely absent or wrong.

3. EVIDENCE & CITATIONS:
   - Extract exact quotes/snippets or LaTeX formula snippets as evidence. Mention page number if multi-page (e.g., "[Page 2] ...").

QUESTION: ${rubric.question}
SUBJECT: ${rubric.subject || 'General'}
MAXIMUM MARKS: ${rubric.maxMarks}

RUBRIC KEY POINTS:
${(rubric.keyPoints || []).map((kp, idx) => `Point ${idx + 1} [ID: ${kp.id}] [Weight: ${kp.weight}]: ${kp.text}`).join('\n')}

Respond ONLY with a JSON object matching this schema:
{
  "transcription": "The full transcribed text and LaTeX math formulas...",
  "suggestedScore": 3.5,
  "feedbackSummary": "A concise 2-sentence summary of strengths, math accuracy, and omissions.",
  "points": [
    {
      "pointId": "${rubric.keyPoints?.[0]?.id || 'pt-1'}",
      "status": "partial",
      "awardedMarks": 0.5,
      "evidenceQuote": "[Page 1] Exact quote or LaTeX formula",
      "justification": "Heading/formula mentioned; awarded partial marks."
    }
  ]
}`;

    const modelsToTry = await getServerModels(serverApiKey);
    let lastError = null;

    // Construct multi-part payload for Gemini Vision API
    const imageParts = cleanPages.map(data => ({
      inlineData: { mimeType: mimeType || 'image/jpeg', data }
    }));

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${serverApiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: prompt },
                ...imageParts
              ]
            }],
            generationConfig: {
              temperature: 0.1
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`${model} (${response.status}): ${errText}`);
          continue;
        }

        const resData = await response.json();
        const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) continue;

        let cleanedJson = candidateText.trim();
        if (cleanedJson.includes('```')) {
          cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        const parsed = JSON.parse(cleanedJson);
        const pointsList = (rubric.keyPoints || []).map(kp => {
          const found = (parsed.points || []).find(p => p.pointId === kp.id);
          if (found) {
            return {
              pointId: kp.id,
              pointText: kp.text,
              weight: kp.weight,
              status: found.status || 'partial',
              awardedMarks: typeof found.awardedMarks === 'number' 
                ? Number(found.awardedMarks.toFixed(2)) 
                : (found.status === 'hit' ? kp.weight : found.status === 'partial' ? Number((kp.weight * 0.5).toFixed(2)) : 0),
              evidenceQuote: found.evidenceQuote || '(Detected in scan)',
              justification: found.justification || ''
            };
          }
          return {
            pointId: kp.id,
            pointText: kp.text,
            weight: kp.weight,
            status: 'missed',
            awardedMarks: 0,
            evidenceQuote: '(Omitted)',
            justification: 'Not detected in student scan'
          };
        });

        const calculatedTotal = pointsList.reduce((sum, p) => sum + p.awardedMarks, 0);

        return res.status(200).json({
          transcription: parsed.transcription || '(Handwriting transcribed by GradeCrow Vision)',
          suggestedScore: Number(calculatedTotal.toFixed(2)),
          maxMarks: rubric.maxMarks,
          feedbackSummary: parsed.feedbackSummary || `Graded via GradeCrow Server Vision (${model}).`,
          points: pointsList,
          mode: 'gemini-server'
        });

      } catch (err) {
        lastError = err;
      }
    }

    return res.status(500).json({ 
      error: 'EVALUATION_FAILED', 
      message: lastError ? lastError.message : 'All model endpoints failed.' 
    });

  } catch (globalErr) {
    return res.status(500).json({ 
      error: 'SERVER_ERROR', 
      message: globalErr.message 
    });
  }
}
