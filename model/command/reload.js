const Logger = require('@elian-wonhalf/pretty-logger');
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

    if (Guild.isMemberMod(member)) {
        await message.reply('OK, I\'m rebooting now.');
        Logger.notice('Reboot asked');
    }
};
