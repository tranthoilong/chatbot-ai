const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {User,Plan,UserPlan,ApiKey,UserRole,Role,RolePermission,Permission} = require("../models/");
// const UserAPIKey = require("../models/UserAPIKey");
const { getUserByApiKey } = require("../utils/authUtils");
const { TYPE_CHAT, TYPE_STATUS } = require("../constants");


const JWT_SECRET = process.env.JWT_SECRET || "123@Long";

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (await User.findOne({ where: { email } })) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        const planId = '76b5d822-c42d-4692-a296-33182642a8c9'
        const roleIdDefault = 'ffc88a0e-eed2-4ec9-ad53-10f3d3291348'
        const plan = await Plan.findByPk(planId);
        await UserPlan.create({
            user_id: newUser.id,
            plan_id: planId,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + plan.duration)),
            status: 1 
        });

        await UserRole.create({
            user_id: newUser.id,
            role_id: roleIdDefault
        });

        res.status(201).json({
            status: 200,
            message: "Đăng ký thành công!"
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Email hoặc mật khẩu không chính xác!" });
        }

        if (user.status !== TYPE_STATUS.ACTIVE) {
            return res.status(403).json({ error: "Tài khoản đã bị khóa!" });
        }

        const roleUser = await UserRole.findOne({ where: { user_id: user.id } });

        if (!roleUser) {
            return res.status(403).json({ error: "Tài khoản không có quyền truy cập!" });
        }
        
        console.log(roleUser);

        const role = await Role.findByPk(roleUser.role_id);

        console.log(role);

        const payload = { id: user.id, role: role.name ,role_id: role.id};

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

        res.json({ status: 200, message: "Đăng nhập thành công!", token, refreshToken });

    } catch (e) {
        console.error("Lỗi đăng nhập:", e);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ["id", "username", "email"] });
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        const userRole = await UserRole.findOne({
            where: { user_id: user.id },
            include: [{
                model: Role,
                attributes: ['id', 'name', 'description']
            }]
        });

        const apiKeys = await ApiKey.findAll({
            where: { user_id: user.id, status: 1 },
            attributes: ['id', 'api_key', 'last_used', 'usage_count']
        });

        const rolePermissions = await RolePermission.findOne({
            where: { role_id: req.user.role_id },
        });

        const permissions = await Permission.findOne({
            where: { id: rolePermissions.permission_id }
        });


        user.dataValues.role = {
            name: userRole.Role.name,
            permissions: permissions.permission,
            is_full_access: permissions.is_full_access
        };

        user.dataValues.apiKeys = apiKeys;

        res.json({ status: 200, message: "Lấy thông tin người dùng thành công!", data: user });

    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function registerPlan(req, res) {
    try {
        const userId = req.user.id;
        const { planId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại!" });
        }

        const plan = await Plan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ error: "Gói dịch vụ không tồn tại!" });
        }

        const existingUserPlan = await UserPlan.findOne({ where: { user_id: userId, status: 1 } });
        if (existingUserPlan) {
            return res.status(400).json({ error: "Người dùng đã có gói dịch vụ!" });
        }

        const newUserPlan = await UserPlan.create({
            user_id: userId,
            plan_id: planId,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + plan.duration)),
            status: 1 
        });

        res.status(201).json({
            status: 200,
            message: "Đăng ký gói dịch vụ thành công!",
            data: {
                userId: user.id,
                planId: plan.id,
                startDate: newUserPlan.start_date,
                endDate: newUserPlan.end_date
            }
        });

    } catch (error) {
        console.error("Lỗi đăng ký gói dịch vụ:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function createApiKey(req, res) {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại!" });
        }
        const apiKey = uuidv4();
        const newApiKey = await ApiKey.create({
            user_id: user.id,  
            api_key: apiKey,     
            usage_count: 0,    
            last_used: null      
        });
        res.status(201).json({
            status: 200,
            message: "API Key được tạo thành công!",
            data: {
                api_key:newApiKey.api_key
            }
        });
    } catch (error) {
        console.error("Lỗi tạo API Key:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function getUserFromApiKey(req, res) {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) return res.status(400).json({ error: "API Key không được cung cấp!" });

        const apiKeyRecord = await ApiKey.findOne({
            where: { api_key: apiKey },
            include: [
                {
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'username', 'email', 'status'],
                    include: [
                        {
                            model: UserPlan,
                            as: 'userPlans',
                            include: [
                                {
                                    model: Plan,
                                    as: 'plan',
                                    attributes: ['id', 'name', 'price', 'max_api_keys', 'max_usage', 'duration', 'description', 'status']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!apiKeyRecord) return res.status(404).json({ error: "API Key không hợp lệ!" });

        const user = apiKeyRecord.user;
            const userPlans = user.userPlans.map(userPlan => {
                return {
                    plan: userPlan.plan,
                    start_date: userPlan.start_date,
                    end_date: userPlan.end_date,
                    status: userPlan.status
                };
            });

        res.json({
            status: 200,
            message: "Lấy thông tin người dùng thành công!",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                plans: userPlans
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng từ API Key:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'status'],
            include: [
                {
                    model: UserPlan,
                    as: 'userPlans',
                    include: [
                        {
                            model: Plan,
                            as: 'plan',
                            attributes: ['id', 'name', 'price', 'max_api_keys', 'max_usage', 'duration', 'description', 'status']
                        }
                    ]
                }
            ]
        });

        res.json({
            status: 200,
            message: "Lấy danh sách người dùng thành công!",
            data: users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                plans: user.userPlans.map(userPlan => ({
                    plan: userPlan.plan,
                    start_date: userPlan.start_date,
                    end_date: userPlan.end_date,
                    status: userPlan.status
                }))
            }))
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error);
        res.status(500).json({ status: 500, message: "Lỗi Server" });
    }
}




module.exports = { register, login, getProfile, createApiKey, getUserFromApiKey, registerPlan, getUsers};
