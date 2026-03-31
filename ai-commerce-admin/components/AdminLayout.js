import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children, title, user }) {
  const router = useRouter();
  const path = router.pathname;

  const nav = [
    { href: '/admin', label: 'Dashboard', icon: '◆' },
    { href: '/admin/intents', label: 'Intents', icon: '→' },
    { href: '/admin/products', label: 'Produtos', icon: '□' },
    { href: '/admin/vendors', label: 'Vendors', icon: '◇' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} — Admin` : 'Admin — AI Commerce'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="dot" />
            Admin Panel
          </div>
          <nav className="sidebar-nav">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={path === item.href ? 'active' : ''}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-user">
            <div>{user || 'admin'}</div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', marginTop: '8px', padding: 0 }}>
              Sair
            </button>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
