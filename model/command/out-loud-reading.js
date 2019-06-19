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

    if (member.roles.has(Config.roles.outLoudReading)) {
        member.removeRole(Config.roles.outLoudReading).then(() => {
            message.reply('you no longer have the Lecture à voix haute role.');
        });
    } else {
        member.addRole(Config.roles.outLoudReading).then(() => {
            message.reply('you now have the Lecture à voix haute role.');
        });
    }
};
