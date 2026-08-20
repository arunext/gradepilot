// Vercel Serverless Function: /api/parse-question
// Parses a handwritten or printed question paper / marking scheme into structured Question + Key Points.

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
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').replace(/[\r\n\s]+/g, '');

    const prompt = `You are GradeCrow AI, an expert exam assistant (gradecrow.com).
Look at this handwritten or printed image of an exam question, marking scheme, or rubric written by a teacher.

Extract:
1. The Question Title or Prompt.
2. The Subject / Course Name (or "General" if not mentioned).
3. The Maximum Marks / Total Score.
4. Each Key Point / Expected Answer Criterion along with its allocated marks/weight.
   If marks for individual points are not explicitly stated, divide the total marks evenly across the points.
5. Key vocabulary keywords for each point.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "question": "The full question text or title...",
  "subject": "Subject or Course Name",
  "maxMarks": 5.0,
  "keyPoints": [
    {
      "text": "Description of criterion or expected concept",
      "weight": 1.0,
      "keywords": ["keyword 1", "keyword 2"]
    }
  ]
}`;

    const modelsToTry = await getServerModels(serverApiKey);
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
        const maxMarks = typeof parsed.maxMarks === 'number' && parsed.maxMarks > 0 ? parsed.maxMarks : 5.0;

        const points = (parsed.keyPoints || []).map((kp, idx) => ({
          id: `pt-${idx + 1}-${Date.now().toString(36)}`,
          text: kp.text || `Point ${idx + 1}`,
          weight: typeof kp.weight === 'number' && kp.weight > 0 ? Number(kp.weight.toFixed(2)) : 1.0,
          keywords: Array.isArray(kp.keywords) ? kp.keywords : []
        }));

        if (points.length === 0) {
          points.push(
            { id: `pt-1-${Date.now().toString(36)}`, text: 'Core concept explanation', weight: maxMarks / 2, keywords: [] },
            { id: `pt-2-${Date.now().toString(36)}`, text: 'Key terminology and details', weight: maxMarks / 2, keywords: [] }
          );
        }

        return res.status(200).json({
          question: parsed.question || 'Scanned Question',
          subject: parsed.subject || 'General',
          maxMarks: maxMarks,
          keyPoints: points
        });

      } catch (err) {
        lastError = err;
      }
    }

    return res.status(500).json({ 
      error: 'PARSE_FAILED', 
      message: lastError ? lastError.message : 'Failed to parse question scheme.' 
    });

  } catch (globalErr) {
    return res.status(500).json({ 
      error: 'SERVER_ERROR', 
      message: globalErr.message 
    });
  }
}
