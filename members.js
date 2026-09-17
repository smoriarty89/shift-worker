import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code' });
  const raw = await kv.get(`group:${code}`);
  if (!raw) return res.status(404).json({ error: 'Not found' });
  const group = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const members = Object.values(group.members || {}).map(m => ({
    name: m.name,
    hasAvailability: m.hasAvailability || false
  }));
  return res.status(200).json({ members });
}
