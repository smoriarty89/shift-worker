import { kvGet } from './kv.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code' });
  const group = await kvGet(`group:${code}`);
  if (!group) return res.status(404).json({ error: 'Not found' });
  const members = Object.values(group.members || {}).map(m => ({ name: m.name, hasAvailability: m.hasAvailability || false }));
  return res.status(200).json({ members });
}
