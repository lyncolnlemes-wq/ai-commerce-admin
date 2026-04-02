export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.ID_BASE_AIRTABLE;

  if (!AIRTABLE_API_KEY || !BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  try {
    // Fetch VISIT_LOG
    const visitRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/VISIT_LOG?pageSize=100&sort[0][field]=visited_at&sort[0][direction]=desc`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );

    // Fetch CLICK_LOG
    const clickRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/CLICK_LOG?pageSize=100&sort[0][field]=clicked_at&sort[0][direction]=desc`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );

    const visitData = visitRes.ok ? await visitRes.json() : { records: [] };
    const clickData = clickRes.ok ? await clickRes.json() : { records: [] };

    const visits = visitData.records || [];
    const clicks = clickData.records || [];

    // Compute stats
    const totalVisits = visits.length;
    const totalClicks = clicks.length;
    const humanVisits = visits.filter(r => !r.fields?.is_bot).length;
    const botVisits = visits.filter(r => r.fields?.is_bot).length;

    // Top pages
    const pageCounts = {};
    visits.forEach(r => {
      const p = r.fields?.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Top agents
    const agentCounts = {};
    visits.forEach(r => {
      const a = r.fields?.agent_name || 'unknown';
      agentCounts[a] = (agentCounts[a] || 0) + 1;
    });
    const topAgents = Object.entries(agentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([agent, count]) => ({ agent, count }));

    return res.status(200).json({
      totalVisits,
      humanVisits,
      botVisits,
      totalClicks,
      topPages,
      topAgents,
      recentVisits: visits.slice(0, 20).map(r => ({
        path: r.fields?.path,
        agent_name: r.fields?.agent_name,
        is_bot: r.fields?.is_bot,
        visited_at: r.fields?.visited_at,
        country: r.fields?.country,
      })),
      recentClicks: clicks.slice(0, 20).map(r => ({
        offer_id: r.fields?.offer_id,
        clicked_at: r.fields?.clicked_at,
        is_bot: r.fields?.is_bot,
      })),
    });
  } catch (err) {
    console.error('analytics error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
