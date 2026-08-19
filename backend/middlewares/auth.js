module.exports = {
  authenticate: (req, res, next) => {
    // Mock authentication
    req.user = { id: 'mock-user-id', role: 'SUPER_ADMIN' };
    next();
  },
  authorize: (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  }
};
