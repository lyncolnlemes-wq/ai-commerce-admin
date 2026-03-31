import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

function formatBRL(v) {
  if (!v && v !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', normalized_name: '', brand: '', model: '', decision_summary: '' });
  const [toast, setToast] = useState('');
  const router = useRouter();

  const load = () => {
    Promise.all([
      fetch('/api/auth/check').then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch('/api/admin/products').then((r) => r.json()),
    ]).then(([auth, data]) => {
      setUser(auth.email);
      setProducts(data.products || []);
      setLoading(false);
    }).catch(() => router.push('/login'));
  };

  useEffect(load, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', normalized_name: '', brand: '', model: '', decision_summary: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name || '', normalized_name: p.normalized_name || '', brand: p.brand || '', model: p.model || '', decision_summary: p.decision_summary || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch('/api/admin/products', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { setShowModal(false); load(); showToast(editing ? 'Produto atualizado' : 'Produto criado'); }
  };

  const filtered = products.filter((p) =>
    (p.normalized_name || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <AdminLayout title="Produtos"><p style={{ color: 'var(--text-muted)' }}>Carregando...</p></AdminLayout>;

  return (
    <AdminLayout title="Produtos" user={user}>
      <div className="page-header">
        <h1>Gestão de Produtos</h1>
        <p>{products.length} produtos cadastrados</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input className="form-input" style={{ maxWidth: '400px' }} placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Produto</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Produto</th><th>Marca</th><th>Ofertas</th><th>Melhor Preço</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {filtered.map((p) => {
              const bestOffer = (p.offers || []).find((o) => o.is_best_offer) || (p.offers || [])[0];
              const publishedCount = (p.offers || []).filter((o) => o.qa_status === 'published').length;
              return (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-primary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.normalized_name || p.name}</td>
                  <td>{p.brand || '—'}</td>
                  <td><span className="badge badge-blue">{(p.offers || []).length}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>{bestOffer ? formatBRL(bestOffer.price) : '—'}</td>
                  <td>
                    {publishedCount > 0
                      ? <span className="badge badge-green">{publishedCount} pub</span>
                      : <span className="badge badge-orange">draft</span>}
                  </td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum produto encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Nome Normalizado</label>
              <input className="form-input" value={form.normalized_name} onChange={(e) => setForm({ ...form, normalized_name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input className="form-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Decision Summary</label>
              <textarea className="form-textarea" value={form.decision_summary} onChange={(e) => setForm({ ...form, decision_summary: e.target.value })} />
            </div>
            <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </AdminLayout>
  );
}
