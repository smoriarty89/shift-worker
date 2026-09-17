async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['GET', key]])
  });
  const data = await res.json();
  const result = data?.[0]?.result;
  if (!result) return null;
  let parsed = result;
  while (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch(e) { break; }
  }
  return parsed;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { code } = req.query;
    const group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Not found' });
    const members = Object.values(group.members || {}).map(m => ({ name: m.name, hasAvailability: m.hasAvailability || false }));
    return res.status(200).json({ members });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
