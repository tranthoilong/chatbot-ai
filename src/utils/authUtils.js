const { User, ApiKey, UserPlan,Plan } = require("../models/");

async function getUserByApiKey(apiKey) {
    try {
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

        if (!apiKeyRecord) return null;

        const user = apiKeyRecord.user;
            const userPlans = user.userPlans.map(userPlan => {
                return {
                    plan: userPlan.plan,
                    start_date: userPlan.start_date,
                    end_date: userPlan.end_date,
                    status: userPlan.status
                };
            });

        return  {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
            plans: userPlans
        };  
    } catch (error) {
        console.error("❌ Error fetching user by API Key:", error);
        return null;  
    }
}

module.exports = { getUserByApiKey };
