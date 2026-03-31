function formatBRL(value) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatRank(value) {
  if (!value && value !== 0) return '—';
  return value.toFixed(2);
}

function slugify(text) {
  return text.toString().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

module.exports = { formatBRL, formatRank, slugify, formatDate };
