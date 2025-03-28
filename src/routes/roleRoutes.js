const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authenticateToken = require('../middleware/authMiddleware');

// Tạo role mới
router.post('/create', authenticateToken, roleController.createRole);

// Lấy danh sách role
router.get('/list', authenticateToken, roleController.getRoles);

// Gán role cho user
router.post('/assign-user', authenticateToken, roleController.assignRoleToUser);

// Gán permission cho role
router.post('/assign-permission', authenticateToken, roleController.assignPermissionToRole);

// Lấy danh sách permission của role
router.get('/:roleId/permissions', authenticateToken, roleController.getRolePermissions);

module.exports = router;
