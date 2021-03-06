const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['setavatar'],
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            global.bot.user.setAvatar(args.join(' ')).then(() => {
                message.reply(trans('model.command.setAvatar.success', [], 'en'))
            }).catch((error) => {
                message.reply(trans('model.command.setAvatar.error', [], 'en'));
                Logger.exception(error);
            });
        }
    }
};
