import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/admin');
    } catch { setError('Erro de conexão'); setLoading(false); }
  };

  return (
    <>
      <Head><title>Login — AI Commerce Admin</title><meta name="robots" content="noindex" /></Head>
      <div className="login-page">
        <div className="login-box">
          <h1>AI Commerce Admin</h1>
          <p className="login-sub">Painel de gestão do Search Engine</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tokencompany.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
