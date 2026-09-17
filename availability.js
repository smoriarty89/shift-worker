import { kvGet, kvSet } from './kv.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { code, memberName, availability } = req.body;
  if (!code || !memberName || !availability) return res.status(400).json({ error: 'Missing fields' });
  const group = await kvGet(`group:${code}`);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  if (!group.members) group.members = {};
  group.members[memberName] = { ...group.members[memberName], name: memberName, hasAvailability: true, availability, updated: Date.now() };
  await kvSet(`group:${code}`, group);
  return res.status(200).json({ ok: true });
}
