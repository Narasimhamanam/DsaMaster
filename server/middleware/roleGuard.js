// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

const requireAdmin = requireRole('admin');
const requireMentor = requireRole('mentor', 'admin');
const requireStudent = requireRole('student', 'mentor', 'admin');

module.exports = { requireRole, requireAdmin, requireMentor, requireStudent };
