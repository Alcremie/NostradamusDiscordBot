const config = require("./config");
const env = {};

env.live = {
    admin: '254476057455886337',
};

env.dev = {
    admin: '242563745556070400',
};

const server = config.DEV_MODE ? env.dev : env.live;

module.exports = server;
