async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  if (!data.result) return null;
  let result = data.result;
  while (typeof result === 'string') {
    try { result = JSON.parse(result); } catch(e) { break; }
  }
  return result;
}
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { code } = req.query;
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
    const allFree = sorted.filter(([d, c]) => c === total).slice(0, 10).map(([date, count]) => ({ date, count, names: dateNames[date] }));
    const partial = sorted.filter(([d, c]) => c < total && c > 1).slice(0, 12).map(([date, count]) => ({ date, count, names: dateNames[date], missing: allNames.filter(n => !dateNames[date].includes(n)) }));
    return res.status(200).json({ allFree, partial, total, needsMore: false });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
