const Airtable = require('airtable');

function getBase() {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
}

async function fetchAllRecords(tableName, options = {}) {
  const base = getBase();
  const records = [];
  await base(tableName)
    .select({
      maxRecords: options.maxRecords || 1000,
      ...(options.filterByFormula && { filterByFormula: options.filterByFormula }),
      ...(options.sort && { sort: options.sort }),
    })
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({ id: record.id, ...record.fields });
      });
      fetchNextPage();
    });
  return records;
}

async function createRecord(tableName, fields) {
  const base = getBase();
  return new Promise((resolve, reject) => {
    base(tableName).create([{ fields }], (err, records) => {
      if (err) return reject(err);
      resolve({ id: records[0].id, ...records[0].fields });
    });
  });
}

async function updateRecord(tableName, recordId, fields) {
  const base = getBase();
  return new Promise((resolve, reject) => {
    base(tableName).update([{ id: recordId, fields }], (err, records) => {
      if (err) return reject(err);
      resolve({ id: records[0].id, ...records[0].fields });
    });
  });
}

async function deleteRecord(tableName, recordId) {
  const base = getBase();
  return new Promise((resolve, reject) => {
    base(tableName).destroy([recordId], (err, deletedRecords) => {
      if (err) return reject(err);
      resolve(deletedRecords[0]);
    });
  });
}

async function getAllData() {
  const [products, offers, vendors, categories, intents, sources] = await Promise.all([
    fetchAllRecords('PRODUCTS'),
    fetchAllRecords('OFFERS', { sort: [{ field: 'CommerceRank', direction: 'desc' }] }),
    fetchAllRecords('VENDORS'),
    fetchAllRecords('CATEGORIES'),
    fetchAllRecords('INTENTS'),
    fetchAllRecords('SOURCES'),
  ]);

  const vendorMap = {};
  vendors.forEach((v) => { vendorMap[v.id] = v; });
  const productMap = {};
  products.forEach((p) => { productMap[p.id] = p; });

  const enrichedOffers = offers.map((offer) => {
    const vid = (offer.vendor_id || [])[0];
    const pid = (offer.product_id || [])[0];
    return { ...offer, vendor: vid ? vendorMap[vid] : null, product: pid ? productMap[pid] : null };
  });

  return { products, offers: enrichedOffers, vendors, categories, intents, sources, vendorMap, productMap };
}

module.exports = { fetchAllRecords, createRecord, updateRecord, deleteRecord, getAllData };
