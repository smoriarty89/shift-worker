import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code, name, memberName } = req.body;
    if (!code || !name || !memberName) return res.status(400).json({ error: 'Missing fields' });
    const group = { code, name, created: Date.now(), members: { [memberName]: { name: memberName, joined: Date.now(), hasAvailability: false } } };
    await kv.set(`group:${code}`, JSON.stringify(group));
    return res.status(200).json({ code, name });
  }

  if (req.method === 'GET') {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code' });
    const raw = await kv.get(`group:${code}`);
    if (!raw) return res.status(404).json({ error: 'Not found' });
    const group = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return res.status(200).json({ name: group.name, code: group.code, memberCount: Object.keys(group.members || {}).length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
