import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { code, memberName } = req.body;
  if (!code || !memberName) return res.status(400).json({ error: 'Missing fields' });
  const raw = await kv.get(`group:${code}`);
  if (!raw) return res.status(404).json({ error: 'Group not found' });
  const group = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!group.members) group.members = {};
  if (!group.members[memberName]) {
    group.members[memberName] = { name: memberName, joined: Date.now(), hasAvailability: false };
  }
  await kv.set(`group:${code}`, JSON.stringify(group));
  return res.status(200).json({ groupName: group.name });
}
