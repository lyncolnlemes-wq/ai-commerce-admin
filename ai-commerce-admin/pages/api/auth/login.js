import { validateCredentials, generateToken, TOKEN_NAME } from '../../../lib/auth';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });

  const user = validateCredentials(email, password);
  if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const token = generateToken(email);
  res.setHeader('Set-Cookie', serialize(TOKEN_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 86400,
  }));
  res.status(200).json({ success: true, email });
}
