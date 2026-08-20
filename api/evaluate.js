// Vercel Serverless Function: /api/evaluate
// Allows GradeCrow to evaluate papers using the owner's server-side GEMINI_API_KEY securely.

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
    const { imageBase64, mimeType = 'image/jpeg', rubric } = req.body || {};

    if (!imageBase64 || !rubric) {
      return res.status(400).json({ error: 'Missing imageBase64 or rubric data.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').replace(/[\r\n\s]+/g, '');

    const prompt = `You are GradeCrow AI, an expert exam evaluation assistant (gradecrow.com).
Look at this student's handwritten exam paper image.
1. Transcribe the entire handwritten text on the paper accurately into the transcription field.
2. Evaluate the student's answer against the following question rubric and criteria.
3. Determine for each key point if it is "hit" (full marks), "partial" (half marks), or "missed" (0 marks).
4. Extract the exact quote from the student's text as evidence.

QUESTION: ${rubric.question}
SUBJECT: ${rubric.subject || 'General'}
MAXIMUM MARKS: ${rubric.maxMarks}

RUBRIC KEY POINTS:
${(rubric.keyPoints || []).map((kp, idx) => `Point ${idx + 1} [ID: ${kp.id}] [Weight: ${kp.weight}]: ${kp.text}`).join('\n')}

Respond ONLY with a JSON object in this exact schema:
{
  "transcription": "The full transcribed text of the student answer...",
  "suggestedScore": 3.5,
  "feedbackSummary": "A concise 2-sentence summary of strengths and omissions.",
  "points": [
    {
      "pointId": "${rubric.keyPoints?.[0]?.id || 'pt-1'}",
      "status": "hit",
      "awardedMarks": 1.0,
      "evidenceQuote": "Exact quote from handwritten text",
      "justification": "Why these marks were awarded"
    }
  ]
}`;

    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.5-flash-preview',
      'gemini-1.5-pro'
    ];

    let lastError = null;

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
                { inlineData: { mimeType: mimeType || 'image/jpeg', data: cleanBase64 } }
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
