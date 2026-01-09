export const jwtConfig = {
  secret: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'pos-system-secret-key',
  expiresIn: '7d',
  refreshExpiresIn: '30d',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Adjusted for local dev usually
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    refreshMaxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

export default jwtConfig;
