import { TOKEN_NAME } from '../../../lib/auth';
import { serialize } from 'cookie';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', serialize(TOKEN_NAME, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 0,
  }));
  res.status(200).json({ success: true });
}
