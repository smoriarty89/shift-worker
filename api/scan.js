export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { image, mediaType, clarifyAnswer } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });
    const prompt = `You are a roster/calendar parsing assistant. Look at this schedule image and extract the days this person is FREE (not working).
${clarifyAnswer ? '\nThe user explains their roster symbols: ' + clarifyAnswer : ''}
Return ONLY a raw JSON object - no markdown, no backticks, no explanation:
{"status":"ok","freeDays":["YYYY-MM-DD"],"month":"Month YYYY","needsClarification":false,"clarifyQuestion":""}
Or if you cannot determine symbols:
{"status":"clarify","freeDays":[],"month":"","needsClarification":true,"clarifyQuestion":"specific question here"}
Rules: free days = days NOT working. Dates in YYYY-MM-DD. Return ONLY JSON.`;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } }, { type: 'text', text: prompt }] }] })
    });
    if (!response.ok) { const e = await response.json().catch(() => ({})); return res.status(500).json({ error: e.error?.message || 'AI error' }); }
    const data = await response.json();
    const text = (data.content || []).map(b => b.text || '').join('');
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(result);
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
