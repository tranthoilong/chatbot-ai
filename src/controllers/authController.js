const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {User,Plan,UserPlan,ApiKey} = require("../models/");
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

        res.status(201).json({
            message: "Đăng ký thành công!",
            data: { id: newUser.id, username: newUser.username, email: newUser.email }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi Server" });
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

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });

        res.json({ message: "Đăng nhập thành công!", token, refreshToken });

    } catch (e) {
        console.error("Lỗi đăng nhập:", e);
        res.status(500).json({ message: "Lỗi Server" });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ["id", "username", "email"] });

        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        res.json({ message: "Lấy thông tin người dùng thành công!", data: user });

    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
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
        res.status(500).json({ error: "Lỗi Server" });
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
            message: "API Key được tạo thành công!",
            data: {
                api_key:newApiKey.api_key
            }
        });
    } catch (error) {
        console.error("Lỗi tạo API Key:", error);
        res.status(500).json({ error: "Lỗi Server" });
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
        res.status(500).json({ error: "Lỗi Server" });
    }
}



module.exports = { register, login, getProfile, createApiKey, getUserFromApiKey, registerPlan};
