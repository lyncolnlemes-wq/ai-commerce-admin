import { requireAuth } from '../../../lib/auth';
import { getAllData } from '../../../lib/airtable';

async function handler(req, res) {
  try {
    const { products, offers, vendors, categories, intents, sources } = await getAllData();

    const totalClicks = offers.reduce((sum, o) => sum + (o.click_count || 0), 0);
    const totalConversions = offers.reduce((sum, o) => sum + (o.conversion_count || 0), 0);

    const revenueByVendor = {};
    let totalRevenue = 0;
    offers.forEach((o) => {
      const conversions = o.conversion_count || 0;
      const price = o.price || 0;
      const commRate = o.vendor?.commission_rate || 0;
      const revenue = conversions * price * commRate;
      totalRevenue += revenue;
      const vName = o.vendor?.vendor_name || 'Desconhecido';
      revenueByVendor[vName] = (revenueByVendor[vName] || 0) + revenue;
    });

    const topProducts = offers
      .filter((o) => (o.conversion_count || 0) > 0)
      .sort((a, b) => (b.conversion_count || 0) - (a.conversion_count || 0))
      .slice(0, 5)
      .map((o) => ({
        name: o.product?.normalized_name || o.product?.name || 'Produto',
        conversions: o.conversion_count || 0,
        clicks: o.click_count || 0,
        revenue: (o.conversion_count || 0) * (o.price || 0) * (o.vendor?.commission_rate || 0),
      }));

    const topVendors = Object.entries(revenueByVendor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    const activeSources = sources.filter((s) => s.crawler_status === 'ativo').length;
    const errorSources = sources.filter((s) => s.crawler_status === 'erro').length;

    res.status(200).json({
      stats: {
        totalProducts: products.length,
        totalOffers: offers.length,
        totalVendors: vendors.length,
        totalIntents: intents.length,
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0',
        activeSources,
        errorSources,
      },
      topProducts,
      topVendors,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
