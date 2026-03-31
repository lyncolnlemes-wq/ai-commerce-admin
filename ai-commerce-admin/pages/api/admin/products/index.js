import { requireAuth } from '../../../../lib/auth';
import { fetchAllRecords, createRecord, updateRecord } from '../../../../lib/airtable';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [products, offers, vendors] = await Promise.all([
        fetchAllRecords('PRODUCTS'),
        fetchAllRecords('OFFERS', { sort: [{ field: 'CommerceRank', direction: 'desc' }] }),
        fetchAllRecords('VENDORS'),
      ]);
      const vendorMap = {};
      vendors.forEach((v) => { vendorMap[v.id] = v; });
      const enriched = products.map((p) => {
        const pOffers = offers.filter((o) => (o.product_id || []).includes(p.id)).map((o) => {
          const vid = (o.vendor_id || [])[0];
          return { ...o, vendor: vid ? vendorMap[vid] : null };
        });
        return { ...p, offers: pOffers };
      });
      return res.status(200).json({ products: enriched });
    }

    if (req.method === 'POST') {
      const fields = req.body;
      if (!fields.name) return res.status(400).json({ error: 'name é obrigatório' });
      if (fields.category && typeof fields.category === 'string') fields.category = [fields.category];
      const record = await createRecord('PRODUCTS', fields);
      return res.status(201).json({ product: record });
    }

    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id é obrigatório' });
      if (fields.category && typeof fields.category === 'string') fields.category = [fields.category];
      const record = await updateRecord('PRODUCTS', id, fields);
      return res.status(200).json({ product: record });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
