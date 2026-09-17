async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } });
  const data = await res.json();
  if (!data.result) return null;
  try { return JSON.parse(data.result); } catch(e) { return data.result; }
}
async function kvSet(key, value) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([`group:${key.split(':')[1]}`, JSON.stringify(value)])
  });
  return res.ok;
}
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { code, name, memberName } = req.body;
      if (!code || !name || !memberName) return res.status(400).json({ error: 'Missing fields' });
      const members = {};
      members[memberName] = { name: memberName, joined: Date.now(), hasAvailability: false };
      const group = { code, name, created: Date.now(), members };
      const setRes = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent('group:' + code)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(group))
      });
      const setData = await setRes.json();
      return res.status(200).json({ code, name, kvResponse: setData });
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
