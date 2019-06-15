const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    let member;

    if (message.guild === null) {
        member = Guild.discordGuild.member(message.author);

        if (member === null) {
            message.reply('sorry, you do not seem to be on the server.');
            return;
        }
    } else {
        member = message.member;
    }

    if (Guild.isMemberMod(member)) {
        await message.reply('OK, I\'m rebooting now.');
        Logger.notice('Reboot asked');
    }
};
