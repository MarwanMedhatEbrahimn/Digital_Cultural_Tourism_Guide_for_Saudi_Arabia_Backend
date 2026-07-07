const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin' || !req.admin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

const requireTourist = (req, res, next) => {
  if (req.userRole !== 'tourist' || !req.tourist) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Tourist privileges required.',
    });
  }
  next();
};

module.exports = {
  requireAdmin,
  requireTourist,
};
