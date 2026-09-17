async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  if (!data.result) return null;
  try { return JSON.parse(data.result); } catch(e) { return data.result; }
}

async function kvSet(key, value) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}/${encoded}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  return data;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { code, name, memberName } = req.body;
      if (!code || !name || !memberName) return res.status(400).json({ error: 'Missing fields' });
      const members = {};
      members[memberName] = { name: memberName, joined: Date.now(), hasAvailability: false };
      const group = { code, name, created: Date.now(), members };
      const kvResult = await kvSet(`group:${code}`, group);
      return res.status(200).json({ code, name, kvResult });
    }
    if (req.method === 'GET') {
      const { code } = req.query;
      const group = await kvGet(`group:${code}`);
      if (!group) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ name: group.name, code: group.code, memberCount: Object.keys(group.members || {}).length, members: group.members });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
