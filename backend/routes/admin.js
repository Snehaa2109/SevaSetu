const express = require('express');
const {
  getDashboard,
  getStats,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  terminateProvider,
} = require('../controllers/adminController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(auth);
router.use(roleAuth('ADMIN'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (ADMIN)
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/stats
// @desc    Get admin stats
// @access  Private (ADMIN)
router.get('/stats', getStats);

// @route   GET /api/admin/providers/pending
// @desc    Get pending provider requests
// @access  Private (ADMIN)
router.get('/providers/pending', getPendingProviders);

// @route   PUT /api/admin/provider/:id/approve
// @desc    Approve provider
// @access  Private (ADMIN)
router.put('/provider/:id/approve', approveProvider);

// @route   PUT /api/admin/provider/:id/reject
// @desc    Reject provider
// @access  Private (ADMIN)
router.put('/provider/:id/reject', rejectProvider);

// @route   DELETE /api/admin/provider/:id
// @desc    Terminate provider
// @access  Private (ADMIN)
router.delete('/provider/:id', terminateProvider);

module.exports = router;