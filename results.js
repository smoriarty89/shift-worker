import { kvGet } from './kv.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code' });
  const group = await kvGet(`group:${code}`);
  if (!group) return res.status(404).json({ error: 'Not found' });
  const members = Object.values(group.members || {});
  const total = members.length;
  const withAvail = members.filter(m => m.hasAvailability && m.availability);
  if (withAvail.length < 2) return res.status(200).json({ needsMore: true });
  const dateCounts = {};
  const dateNames = {};
  withAvail.forEach(m => {
    (m.availability || []).forEach(d => {
      dateCounts[d] = (dateCounts[d] || 0) + 1;
      if (!dateNames[d]) dateNames[d] = [];
      dateNames[d].push(m.name);
    });
  });
  const allNames = members.map(m => m.name);
  const sorted = Object.entries(dateCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const allFree = sorted.filter(([d, count]) => count === total).slice(0, 10).map(([date, count]) => ({ date, count, names: dateNames[date] }));
  const partial = sorted.filter(([d, count]) => count < total && count > 1).slice(0, 12).map(([date, count]) => ({ date, count, names: dateNames[date], missing: allNames.filter(n => !dateNames[date].includes(n)) }));
  return res.status(200).json({ allFree, partial, total, needsMore: false });
}
