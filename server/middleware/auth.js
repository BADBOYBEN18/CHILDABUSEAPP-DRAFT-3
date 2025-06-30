import jwt from 'jsonwebtoken';
import Case from '../models/Case.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

export const isCaseAssignee = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.id;

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if user is assigned to the case or is a supervisor
    if (
      caseItem.assignedTo.toString() === userId ||
      caseItem.supervisor.toString() === userId ||
      req.user.role === 'admin'
    ) {
      next();
    } else {
      return res.status(403).json({
        message: 'You do not have permission to access this case',
      });
    }
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ message: 'Authorization error' });
  }
};
