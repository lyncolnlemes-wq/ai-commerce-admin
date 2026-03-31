import { requireAuth } from '../../../../lib/auth';
import { fetchAllRecords, createRecord, updateRecord, deleteRecord } from '../../../../lib/airtable';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const intents = await fetchAllRecords('INTENTS');
      return res.status(200).json({ intents });
    }

    if (req.method === 'POST') {
      const { intent_query, category, use_case, price_range_min, price_range_max, url_slug, decision_reason } = req.body;
      if (!intent_query) return res.status(400).json({ error: 'intent_query é obrigatório' });

      const slug = url_slug || intent_query.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const fields = {
        intent_query,
        url_slug: slug,
        last_updated: new Date().toISOString().split('T')[0],
      };
      if (use_case) fields.use_case = use_case;
      if (decision_reason) fields.decision_reason = decision_reason;
      if (price_range_min) fields.price_range_min = Number(price_range_min);
      if (price_range_max) fields.price_range_max = Number(price_range_max);
      if (category) fields.category = [category];

      const record = await createRecord('INTENTS', fields);
      return res.status(201).json({ intent: record });
    }

    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id é obrigatório' });
      if (fields.category && typeof fields.category === 'string') fields.category = [fields.category];
      if (fields.decision_product_id && typeof fields.decision_product_id === 'string') fields.decision_product_id = [fields.decision_product_id];
      fields.last_updated = new Date().toISOString().split('T')[0];
      const record = await updateRecord('INTENTS', id, fields);
      return res.status(200).json({ intent: record });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id é obrigatório' });
      await deleteRecord('INTENTS', id);
      return res.status(200).json({ deleted: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Intents API error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
