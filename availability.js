import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { code, memberName, availability } = req.body;
  if (!code || !memberName || !availability) return res.status(400).json({ error: 'Missing fields' });
  const raw = await kv.get(`group:${code}`);
  if (!raw) return res.status(404).json({ error: 'Group not found' });
  const group = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!group.members) group.members = {};
  group.members[memberName] = {
    ...group.members[memberName],
    name: memberName,
    hasAvailability: true,
    availability: availability,
    updated: Date.now()
  };
  await kv.set(`group:${code}`, JSON.stringify(group));
  return res.status(200).json({ ok: true });
}
