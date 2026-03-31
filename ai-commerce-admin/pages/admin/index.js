import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

function formatBRL(v) {
  if (!v && v !== 0) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/check').then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch('/api/admin/dashboard').then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([auth, dash]) => {
      setUser(auth.email);
      setData(dash);
      setLoading(false);
    }).catch(() => router.push('/login'));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><p style={{ color: 'var(--text-muted)' }}>Carregando dashboard...</p></AdminLayout>;

  const s = data.stats;

  return (
    <AdminLayout title="Dashboard" user={user}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do AI Commerce Search Engine</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-green">
          <div className="stat-label">Receita Estimada</div>
          <div className="stat-value">{formatBRL(s.totalRevenue)}</div>
          <div className="stat-sub">comissões de afiliados</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-label">Conversões</div>
          <div className="stat-value">{s.totalConversions}</div>
          <div className="stat-sub">taxa: {s.conversionRate}%</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-label">Cliques</div>
          <div className="stat-value">{s.totalClicks}</div>
          <div className="stat-sub">em links de afiliado</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-label">Intents</div>
          <div className="stat-value">{s.totalIntents}</div>
          <div className="stat-sub">decisões publicadas</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Produtos</div>
          <div className="stat-value">{s.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ofertas</div>
          <div className="stat-value">{s.totalOffers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Vendors</div>
          <div className="stat-value">{s.totalVendors}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sources</div>
          <div className="stat-value">{s.activeSources} <span style={{ fontSize: '0.875rem', color: 'var(--accent-green)' }}>ativas</span></div>
          {s.errorSources > 0 && <div className="stat-sub" style={{ color: 'var(--accent-red)' }}>{s.errorSources} com erro</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="table-wrap">
          <div style={{ padding: '16px 16px 0' }}><div className="section-title">Top 5 Produtos (Conversões)</div></div>
          <table className="data-table">
            <thead><tr><th>Produto</th><th>Conv.</th><th>Cliques</th><th>Receita</th></tr></thead>
            <tbody>
              {data.topProducts.length > 0 ? data.topProducts.map((p, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                  <td><span className="badge badge-green">{p.conversions}</span></td>
                  <td>{p.clicks}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatBRL(p.revenue)}</td>
                </tr>
              )) : <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma conversão registrada ainda</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <div style={{ padding: '16px 16px 0' }}><div className="section-title">Top 5 Vendors (Receita)</div></div>
          <table className="data-table">
            <thead><tr><th>Vendor</th><th>Receita</th></tr></thead>
            <tbody>
              {data.topVendors.length > 0 ? data.topVendors.map((v, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)' }}>{v.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>{formatBRL(v.revenue)}</td>
                </tr>
              )) : <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma receita registrada ainda</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
