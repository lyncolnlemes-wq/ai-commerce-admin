import { requireAuth } from '../../../../lib/auth';
import { fetchAllRecords, createRecord, updateRecord } from '../../../../lib/airtable';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [vendors, sources] = await Promise.all([
        fetchAllRecords('VENDORS'),
        fetchAllRecords('SOURCES'),
      ]);
      const enriched = vendors.map((v) => {
        const vSources = sources.filter((s) => (s.vendor_id || []).includes(v.id));
        return { ...v, sources: vSources };
      });
      return res.status(200).json({ vendors: enriched });
    }

    if (req.method === 'POST') {
      const fields = req.body;
      if (!fields.vendor_name) return res.status(400).json({ error: 'vendor_name é obrigatório' });
      if (fields.trust_score) fields.trust_score = Number(fields.trust_score);
      if (fields.commission_rate) fields.commission_rate = Number(fields.commission_rate);
      const record = await createRecord('VENDORS', fields);
      return res.status(201).json({ vendor: record });
    }

    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id é obrigatório' });
      if (fields.trust_score) fields.trust_score = Number(fields.trust_score);
      if (fields.commission_rate) fields.commission_rate = Number(fields.commission_rate);
      const record = await updateRecord('VENDORS', id, fields);
      return res.status(200).json({ vendor: record });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Vendors API error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
