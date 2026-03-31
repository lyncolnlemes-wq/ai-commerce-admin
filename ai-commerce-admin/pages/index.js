import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/check').then((r) => {
      if (r.ok) router.replace('/admin');
      else router.replace('/login');
    }).catch(() => router.replace('/login'));
  }, []);
  return <div className="login-page"><p style={{ color: 'var(--text-muted)' }}>Carregando...</p></div>;
}
