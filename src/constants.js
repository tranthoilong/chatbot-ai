const TYPE_CHAT = Object.freeze({
    PRO: "pro",
    PREMIUM: "premium",
    FREE_TRIAL: "free trial"
});

const TYPE_STATUS = Object.freeze({
    ACTIVE: 1,
    INACTIVE: 0,
    BLOCKED: 2,
    DELETED: -1,
});

module.exports = { TYPE_CHAT, TYPE_STATUS };
