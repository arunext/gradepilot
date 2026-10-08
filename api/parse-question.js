// Vercel Serverless Function: /api/parse-question
// Parses a handwritten or printed question paper / marking scheme into structured Question + Key Points.

let cachedServerModels = null;

const ALLOWED_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.5-flash'
];

async function getServerModels(serverApiKey) {
  if (cachedServerModels && cachedServerModels.length > 0) return cachedServerModels;
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${serverApiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const valid = (listData.models || [])
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(m => ALLOWED_MODELS.includes(m));

      valid.sort((a, b) => {
        const idxA = ALLOWED_MODELS.indexOf(a);
        const idxB = ALLOWED_MODELS.indexOf(b);
        return idxA - idxB;
      });

      if (valid.length > 0) {
        const candidates = valid.slice(0, 3);
        cachedServerModels = candidates;
        return candidates;
      }
    }
  } catch (e) {
    console.warn('Server model discovery failed:', e);
  }
  return ['gemini-flash-latest', 'gemini-2.5-flash'];
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
    const { pagesBase64, imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    const rawPages = (Array.isArray(pagesBase64) && pagesBase64.length > 0)
      ? pagesBase64
      : (imageBase64 ? [imageBase64] : []);

    if (rawPages.length === 0) {
      return res.status(400).json({ error: 'Missing imageBase64 or pagesBase64 data.' });
    }

    const imageParts = rawPages.map(pageStr => {
      let pageMime = mimeType;
      let clean = pageStr;
      if (pageStr.startsWith('data:')) {
        const match = pageStr.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        if (match) pageMime = match[1];
        clean = pageStr.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      }
      clean = clean.replace(/[\r\n\s]+/g, '');
      return {
        inlineData: { mimeType: pageMime, data: clean }
      };
    });

    const prompt = `You are GradeCrow AI, an expert exam question paper scanner (gradecrow.com).
Look at the attached handwritten or printed image(s) of an exam question paper (${imageParts.length} page(s)), marking scheme, or master rubric written by a teacher.

The document may contain ONE question or MULTIPLE questions (e.g. Q1, Q2, Q3... up to Q20) across all pages.

Extract:
1. Overall Exam Title or Course Subject.
2. Total Maximum Marks for the whole paper across all questions.
3. Every individual Question (numbered Q1, Q2, etc.) across all pages, its allocated max marks, and its granular key answer points/criteria with individual point weights.
4. Relevant vocabulary keywords for each point.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "examTitle": "Title of Exam Paper or Course Name",
  "subject": "Subject Name",
  "totalMaxMarks": 20.0,
  "questions": [
    {
      "number": 1,
      "title": "Q1: Full question 1 text...",
      "maxMarks": 10.0,
      "keyPoints": [
        {
          "text": "Criterion or expected step description",
          "weight": 2.5,
          "keywords": ["keyword1", "keyword2"]
        }
      ]
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
                ...imageParts
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              ...(model.includes('2.5') || model.includes('thinking') ? { thinkingConfig: { thinkingBudget: 0 } } : {})
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

        const rawQuestions = Array.isArray(parsed.questions) && parsed.questions.length > 0
          ? parsed.questions
          : [{ number: 1, title: parsed.question || 'Scanned Question', maxMarks: parsed.maxMarks || 5.0, keyPoints: parsed.keyPoints || [] }];

        const formattedQuestions = rawQuestions.map((q, qIdx) => {
          const qMaxMarks = typeof q.maxMarks === 'number' && q.maxMarks > 0 ? q.maxMarks : 5.0;
          const points = (q.keyPoints || []).map((kp, kIdx) => ({
            id: `kp-${qIdx + 1}-${kIdx + 1}-${Date.now().toString(36)}`,
            text: kp.text || `Point ${kIdx + 1}`,
            weight: typeof kp.weight === 'number' && kp.weight > 0 ? Number(kp.weight.toFixed(2)) : 1.0,
            keywords: Array.isArray(kp.keywords) ? kp.keywords : []
          }));

          if (points.length === 0) {
            points.push(
              { id: `kp-${qIdx + 1}-1-${Date.now().toString(36)}`, text: 'Core concept explanation & working', weight: qMaxMarks / 2, keywords: [] },
              { id: `kp-${qIdx + 1}-2-${Date.now().toString(36)}`, text: 'Key terminology & details', weight: qMaxMarks / 2, keywords: [] }
            );
          }

          return {
            id: `q-${qIdx + 1}-${Date.now().toString(36)}`,
            number: q.number || (qIdx + 1),
            title: q.title || `Question ${qIdx + 1}`,
            maxMarks: qMaxMarks,
            keyPoints: points
          };
        });

        const totalMaxMarks = (formattedQuestions || []).reduce((acc, q) => acc + (q?.maxMarks || 0), 0);

        return res.status(200).json({
          examTitle: parsed.examTitle || 'Scanned Exam Paper',
          subject: parsed.subject || 'General',
          totalMaxMarks: totalMaxMarks,
          isMultiQuestion: true,
          questions: formattedQuestions
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
