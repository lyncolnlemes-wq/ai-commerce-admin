import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function IntentsPage() {
  const [intents, setIntents] = useState([]);
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ intent_query: '', use_case: '', url_slug: '', decision_reason: '', price_range_min: '', price_range_max: '' });
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const load = () => {
    Promise.all([
      fetch('/api/auth/check').then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch('/api/admin/intents').then((r) => r.json()),
    ]).then(([auth, data]) => {
      setUser(auth.email);
      setIntents(data.intents || []);
      setLoading(false);
    }).catch(() => router.push('/login'));
  };

  useEffect(load, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => {
    setEditing(null);
    setForm({ intent_query: '', use_case: '', url_slug: '', decision_reason: '', price_range_min: '', price_range_max: '' });
    setShowModal(true);
  };

  const openEdit = (intent) => {
    setEditing(intent);
    setForm({
      intent_query: intent.intent_query || '',
      use_case: intent.use_case || '',
      url_slug: intent.url_slug || '',
      decision_reason: intent.decision_reason || '',
      price_range_min: intent.price_range_min || '',
      price_range_max: intent.price_range_max || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch('/api/admin/intents', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { setShowModal(false); load(); showToast(editing ? 'Intent atualizada' : 'Intent criada'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta intent?')) return;
    const res = await fetch('/api/admin/intents', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    if (res.ok) { load(); showToast('Intent excluída'); }
  };

  const filtered = intents.filter((i) =>
    (i.intent_query || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.use_case || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <AdminLayout title="Intents"><p style={{ color: 'var(--text-muted)' }}>Carregando...</p></AdminLayout>;

  return (
    <AdminLayout title="Intents" user={user}>
      <div className="page-header">
        <h1>Gestão de Intents</h1>
        <p>{intents.length} decisões cadastradas</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input className="form-input" style={{ maxWidth: '400px' }} placeholder="Buscar intents..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openCreate}>+ Nova Intent</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Query</th><th>Use Case</th><th>Slug</th><th>Atualizado</th><th>Ações</th></tr></thead>
          <tbody>
            {filtered.map((intent) => (
              <tr key={intent.id}>
                <td style={{ color: 'var(--text-primary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intent.intent_query}</td>
                <td><span className="badge badge-blue">{intent.use_case || '—'}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{intent.url_slug || '—'}</td>
                <td style={{ fontSize: '0.75rem' }}>{intent.last_updated || '—'}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(intent)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(intent.id)}>×</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma intent encontrada</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Intent' : 'Nova Intent'}</h2>
            <div className="form-group">
              <label className="form-label">Query (pergunta do usuário)</label>
              <input className="form-input" value={form.intent_query} onChange={(e) => setForm({ ...form, intent_query: e.target.value })} placeholder="melhor notebook custo benefício 2026" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Use Case</label>
                <select className="form-select" value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })}>
                  <option value="">Selecione</option>
                  <option value="geral">Geral</option>
                  <option value="gamer">Gamer</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="comparação">Comparação</option>
                  <option value="executivo">Executivo</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                  <option value="vendas">Vendas</option>
                  <option value="programação">Programação</option>
                  <option value="apple">Apple</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">URL Slug (auto-gerado se vazio)</label>
                <input className="form-input" value={form.url_slug} onChange={(e) => setForm({ ...form, url_slug: e.target.value })} placeholder="melhor-notebook-custo-beneficio-2026" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preço Mínimo (R$)</label>
                <input className="form-input" type="number" value={form.price_range_min} onChange={(e) => setForm({ ...form, price_range_min: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Preço Máximo (R$)</label>
                <input className="form-input" type="number" value={form.price_range_max} onChange={(e) => setForm({ ...form, price_range_max: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Razão da Decisão</label>
              <textarea className="form-textarea" value={form.decision_reason} onChange={(e) => setForm({ ...form, decision_reason: e.target.value })} placeholder="Explicação de por que esta é a melhor opção..." />
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
