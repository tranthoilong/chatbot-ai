const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const UserAPIKey = require("../models/UserAPIKey");
const { getUserByApiKey } = require("../utils/authUtils");
const { TYPE_CHAT, TYPE_STATUS } = require("../constants");

const JWT_SECRET = process.env.JWT_SECRET || "123@Long";

async function register(req, res) {
    try {
        const { username, email, password, type_account } = req.body;

        if (await User.findOne({ where: { email } })) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword, type_account });

        res.status(201).json({
            message: "Đăng ký thành công!",
            data: { id: newUser.id, username: newUser.username, email: newUser.email, type_account: newUser.type_account }
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
        const user = await User.findByPk(req.user.id, { attributes: ["id", "username", "email", "type_account"] });

        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

        res.json({ message: "Lấy thông tin người dùng thành công!", data: user });

    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
}

async function createApiKey(req, res) {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: "Người dùng không tồn tại!" });

        const newAPIKey = await UserAPIKey.create({ user_id: user.id, api_key: uuidv4(), is_active: true });

        res.status(201).json({ message: "API Key được tạo thành công!", api_key: newAPIKey.api_key });

    } catch (error) {
        console.error("Lỗi tạo API Key:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
}

async function getUserFromApiKey(req, res) {
    try {
        const apiKey = req.headers["x-api-key"];
        if (!apiKey) return res.status(400).json({ error: "API Key không được cung cấp!" });

        const user = await getUserByApiKey(apiKey);
        if (!user) return res.status(404).json({ error: "API Key không hợp lệ!" });

        res.json({ message: "Lấy thông tin user thành công!", data: { id: user.id, username: user.username, email: user.email, type_account: user.type_account } });

    } catch (error) {
        console.error("Lỗi lấy user từ API Key:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
}

module.exports = { register, login, getProfile, createApiKey, getUserFromApiKey };
