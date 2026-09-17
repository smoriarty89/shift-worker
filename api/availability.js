async function kvGet(key) {
  const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(JSON.stringify(value))
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { code, memberName, availability } = req.body;
    if (!code || !memberName || !availability) return res.status(400).json({ error: 'Missing fields' });
    
    let group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Group not
