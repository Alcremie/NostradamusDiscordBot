const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = Guild.getMemberFromMessage(message);

    if (member === null) {
        message.reply('sorry, you do not seem to be on the server.');
        return;
    }

    if (member.roles.has(Config.roles.miniClass)) {
        member.removeRole(Config.roles.miniClass).then(() => {
            message.reply('you no longer have the mini-class role.');
        });
    } else {
        member.addRole(Config.roles.miniClass).then(() => {
            message.reply('you now have the mini-class role.');
        });
    }
};
