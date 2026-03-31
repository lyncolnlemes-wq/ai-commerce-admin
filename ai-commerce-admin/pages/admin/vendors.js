import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vendor_name: '', website: '', affiliate_platform: '', commission_rate: '', trust_score: '0.5', vendor_confidence_level: 'medio', region_scope: 'Brasil' });
  const [toast, setToast] = useState('');
  const router = useRouter();

  const load = () => {
    Promise.all([
      fetch('/api/auth/check').then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch('/api/admin/vendors').then((r) => r.json()),
    ]).then(([auth, data]) => {
      setUser(auth.email);
      setVendors(data.vendors || []);
      setLoading(false);
    }).catch(() => router.push('/login'));
  };

  useEffect(load, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => {
    setEditing(null);
    setForm({ vendor_name: '', website: '', affiliate_platform: '', commission_rate: '', trust_score: '0.5', vendor_confidence_level: 'medio', region_scope: 'Brasil' });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      vendor_name: v.vendor_name || '', website: v.website || '', affiliate_platform: v.affiliate_platform || '',
      commission_rate: v.commission_rate || '', trust_score: v.trust_score || '0.5',
      vendor_confidence_level: v.vendor_confidence_level || 'medio', region_scope: v.region_scope || 'Brasil',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch('/api/admin/vendors', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { setShowModal(false); load(); showToast(editing ? 'Vendor atualizado' : 'Vendor criado'); }
  };

  const trustColor = (score) => {
    if (score >= 0.8) return 'badge-green';
    if (score >= 0.5) return 'badge-orange';
    return 'badge-red';
  };

  if (loading) return <AdminLayout title="Vendors"><p style={{ color: 'var(--text-muted)' }}>Carregando...</p></AdminLayout>;

  return (
    <AdminLayout title="Vendors" user={user}>
      <div className="page-header">
        <h1>Gestão de Vendors</h1>
        <p>{vendors.length} parceiros cadastrados</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Vendor</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Vendor</th><th>Plataforma</th><th>Comissão</th><th>Trust Score</th><th>Sources</th><th>Ações</th></tr></thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.vendor_name}</div>
                  {v.website && <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{v.website}</div>}
                </td>
                <td>{v.affiliate_platform || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{v.commission_rate ? `${(v.commission_rate * 100).toFixed(1)}%` : '—'}</td>
                <td><span className={`badge ${trustColor(v.trust_score)}`}>{v.trust_score ? v.trust_score.toFixed(2) : '—'}</span></td>
                <td><span className="badge badge-blue">{(v.sources || []).length}</span></td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Vendor' : 'Novo Vendor'}</h2>
            <div className="form-group">
              <label className="form-label">Nome do Vendor</label>
              <input className="form-input" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="Amazon Brasil" />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://www.amazon.com.br" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Plataforma de Afiliado</label>
                <input className="form-input" value={form.affiliate_platform} onChange={(e) => setForm({ ...form, affiliate_platform: e.target.value })} placeholder="Amazon Associates" />
              </div>
              <div className="form-group">
                <label className="form-label">Taxa de Comissão (decimal: 0.05 = 5%)</label>
                <input className="form-input" type="number" step="0.01" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Trust Score (0 a 1)</label>
                <input className="form-input" type="number" step="0.01" min="0" max="1" value={form.trust_score} onChange={(e) => setForm({ ...form, trust_score: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Nível de Confiança</label>
                <select className="form-select" value={form.vendor_confidence_level} onChange={(e) => setForm({ ...form, vendor_confidence_level: e.target.value })}>
                  <option value="alto">Alto</option>
                  <option value="medio">Médio</option>
                  <option value="baixo">Baixo</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Região</label>
              <input className="form-input" value={form.region_scope} onChange={(e) => setForm({ ...form, region_scope: e.target.value })} />
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
