const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role check.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role forbidden. Action requires one of: [${roles.join(', ')}]. Current role: '${req.user.role}'`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
