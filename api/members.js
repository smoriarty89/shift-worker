async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { code } = req.query;
    const group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Not found' });
    const members = Object.values(group.members || {}).map(m => ({ name: m.name, hasAvailability: m.hasAvailability || false }));
    return res.status(200).json({ members });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
