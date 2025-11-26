export const jwtConfig = {
  secret: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'pos-system-secret-key',
  expiresIn: '7d',
  refreshExpiresIn: '30d'
};

export default jwtConfig;
