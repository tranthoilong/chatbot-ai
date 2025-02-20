const User = require("./User");
const Plan = require("./Plan");
const UserPlan = require("./UserPlan");
const ApiKey = require("./ApiKey");
const ChatId = require("./ChatId");
const ChatMessage = require("./ChatMessage");

User.hasMany(UserPlan, { foreignKey: 'user_id' });
UserPlan.belongsTo(User, { foreignKey: 'user_id' });

Plan.hasMany(UserPlan, { foreignKey: 'plan_id' });
UserPlan.belongsTo(Plan, { foreignKey: 'plan_id' });

User.hasMany(ApiKey, { foreignKey: 'user_id' });
ApiKey.belongsTo(User, { foreignKey: 'user_id' });

ApiKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserPlan, { foreignKey: 'user_id', as: 'userPlans' });
UserPlan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserPlan.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(UserPlan, { foreignKey: 'plan_id', as: 'userPlans' });

ApiKey.hasMany(ChatId, { foreignKey: "api_key" });
ChatId.belongsTo(ApiKey, { foreignKey: "api_key" });

ChatId.hasMany(ChatMessage, { foreignKey: "chat_id" });
ChatMessage.belongsTo(ChatId, { foreignKey: "chat_id" });

module.exports = { User, Plan, UserPlan, ApiKey, ChatId, ChatMessage };
