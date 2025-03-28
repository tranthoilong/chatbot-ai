const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const RolePermission = require('../models/RolePermission');
const Permission = require('../models/Permission');

// Tạo role mới
async function createRole(req, res) {
    try {
        const { name, description } = req.body;

        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            return res.status(400).json({ error: "Role đã tồn tại!" });
        }

        const newRole = await Role.create({
            name,
            description,
            status: 1
        });

        res.status(201).json({
            status: 200,
            message: "Tạo role thành công!",
            data: newRole
        });

    } catch (error) {
        console.error("Lỗi tạo role:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

// Lấy danh sách role
async function getRoles(req, res) {
    try {
        const roles = await Role.findAll();

        res.json({
            status: 200,
            message: "Lấy danh sách role thành công!",
            data: roles
        });

    } catch (error) {
        console.error("Lỗi lấy danh sách role:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

// Gán role cho user
async function assignRoleToUser(req, res) {
    try {
        const { userId, roleId } = req.body;

        const existingUserRole = await UserRole.findOne({
            where: {
                user_id: userId,
                role_id: roleId
            }
        });

        if (existingUserRole) {
            return res.status(400).json({ error: "User đã có role này!" });
        }

        const newUserRole = await UserRole.create({
            user_id: userId,
            role_id: roleId,
            status: 1
        });

        res.status(201).json({
            status: 200,
            message: "Gán role cho user thành công!",
            data: newUserRole
        });

    } catch (error) {
        console.error("Lỗi gán role:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

// Gán permission cho role
async function assignPermissionToRole(req, res) {
    try {
        const { roleId, permissionId } = req.body;

        const existingRolePermission = await RolePermission.findOne({
            where: {
                role_id: roleId,
                permission_id: permissionId
            }
        });

        if (existingRolePermission) {
            return res.status(400).json({ error: "Role đã có permission này!" });
        }

        const newRolePermission = await RolePermission.create({
            role_id: roleId,
            permission_id: permissionId,
            status: 1
        });

        res.status(201).json({
            status: 200,
            message: "Gán permission cho role thành công!",
            data: newRolePermission
        });

    } catch (error) {
        console.error("Lỗi gán permission:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

// Lấy danh sách permission của role
async function getRolePermissions(req, res) {
    try {
        const { roleId } = req.params;

        const permissions = await RolePermission.findAll({
            where: { role_id: roleId },
            include: [{
                model: Permission
            }]
        });

        if (!permissions) {
            return res.status(404).json({ error: "Không tìm thấy permissions!" });
        }

        res.json({
            status: 200,
            message: "Lấy danh sách permission thành công!",
            data: permissions
        });

    } catch (error) {
        console.error("Lỗi lấy permissions:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

module.exports = {
    createRole,
    getRoles,
    assignRoleToUser,
    assignPermissionToRole,
    getRolePermissions
};
