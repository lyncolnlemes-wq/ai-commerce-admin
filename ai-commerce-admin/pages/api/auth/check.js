import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default function handler(req, res) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ authenticated: false });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ authenticated: false });
  res.status(200).json({ authenticated: true, email: decoded.email });
}
