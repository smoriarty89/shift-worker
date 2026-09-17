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
    headers:
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { code, name, memberName } = req.body;
      if (!code || !name || !memberName) return res.status(400).json({ error: 'Missing fields' });
      const members = {};
      members[memberName] = { name: memberName, joined: Date.now(), hasAvailability: false };
      const group = { code, name, created: Date.now(), members };
      await kvSet(`group:${code}`, group);
      const verify = await kvGet(`group:${code}`);
      return res.status(200).json({ code, name, verify });
    }
    if (req.method === 'GET') {
      const { code } = req.query;
      const group = await kvGet(`group:${code}`);
      if (!group) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ name: group.name, code: group.code, memberCount: Object.keys(group.members || {}).length, members: group.members });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) { return res.status(500).json({ error: e.message, stack: e.stack }); }
}
