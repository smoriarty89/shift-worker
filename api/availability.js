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

async function kvSet(key, value) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['SET', key, JSON.stringify(value)]])
  });
  return res.ok;
}
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { code, memberName, availability } = req.body;
    if (!code || !memberName || !availability) return res.status(400).json({ error: 'Missing fields' });
    const group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.members) group.members = {};
    group.members[memberName] = { name: memberName, hasAvailability: true, availability, updated: Date.now() };
    await kvSet(`group:${code}`, group);
    return res.status(200).json({ ok: true });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
