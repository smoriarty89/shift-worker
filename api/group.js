import { kvGet, kvSet } from './kv.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code, name, memberName } = req.body;
    if (!code || !name || !memberName) return res.status(400).json({ error: 'Missing fields' });
    const group = { code, name, created: Date.now(), members: { [memberName]: { name: memberName, joined: Date.now(), hasAvailability: false } } };
    await kvSet(`group:${code}`, group);
    return res.status(200).json({ code, name });
  }
  if (req.method === 'GET') {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code' });
    const group = await kvGet(`group:${code}`);
    if (!group) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ name: group.name, code: group.code, memberCount: Object.keys(group.members || {}).length });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
