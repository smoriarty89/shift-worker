async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  if (!data.result) return null;
  try {
    const first = JSON.parse(data.result);
    if (typeof first === 'string') return JSON.parse(first);
    return first;
  } catch(e) { return null; }
}
async function kvSet(key, value) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(JSON.stringify(value)) });
  return res.ok;
}
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { code, memberName } = req.body;
    if (!code || !memberName) return res.status(400).json({ error: 'Missing fields' });
    const group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.members) group.members = {};
    if (!group.members[memberName]) group.members[memberName] = { name: memberName, joined: Date.now(), hasAvailability: false };
    await kvSet(`group:${code}`, group);
    return res.status(200).json({ groupName: group.name });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
