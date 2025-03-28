const User = require("./User");
const Role = require("./Role");
const UserRole = require("./UserRole");
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");
const Plan = require("./Plan");
const UserPlan = require("./UserPlan");
const ApiKey = require("./ApiKey");
const ChatId = require("./ChatId");
const ChatMessage = require("./ChatMessage");

// User-Role relationships
User.hasMany(UserRole, { foreignKey: 'user_id' });
UserRole.belongsTo(User, { foreignKey: 'user_id' });
Role.hasMany(UserRole, { foreignKey: 'role_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });

// Role-Permission relationships
Role.hasMany(RolePermission, { foreignKey: 'role_id' });
RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
Permission.hasMany(RolePermission, { foreignKey: 'permission_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

// User-Plan relationships
User.hasMany(UserPlan, { foreignKey: 'user_id' });
UserPlan.belongsTo(User, { foreignKey: 'user_id' });
Plan.hasMany(UserPlan, { foreignKey: 'plan_id' });
UserPlan.belongsTo(Plan, { foreignKey: 'plan_id' });

// User-ApiKey relationships
User.hasMany(ApiKey, { foreignKey: 'user_id' });
ApiKey.belongsTo(User, { foreignKey: 'user_id' });

// Named relationships
ApiKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserPlan, { foreignKey: 'user_id', as: 'userPlans' });
UserPlan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserPlan.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(UserPlan, { foreignKey: 'plan_id', as: 'userPlans' });

// Chat relationships
ApiKey.hasMany(ChatId, { foreignKey: "api_key" });
ChatId.belongsTo(ApiKey, { foreignKey: "api_key" });
ChatId.hasMany(ChatMessage, { foreignKey: "chat_id" });
ChatMessage.belongsTo(ChatId, { foreignKey: "chat_id" });

module.exports = { 
    User, 
    Role,
    UserRole,
    Permission,
    RolePermission,
    Plan, 
    UserPlan, 
    ApiKey, 
    ChatId, 
    ChatMessage 
};
