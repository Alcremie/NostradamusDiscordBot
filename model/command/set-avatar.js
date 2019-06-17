const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const member = Guild.getMemberFromMessage(message);

    if (member === null) {
        message.reply('sorry, you do not seem to be on the server.');
        return;
    }

    if (Guild.isMemberMod(member)) {
        global.bot.user.setAvatar(args.join(' ')).then(() => {
            message.reply('my avatar has been changed!')
        }).catch((error) => {
            message.reply('there has been an error changing my avatar. Check the logs for more details.');
            Logger.exception(error);
        });
    }
};
