const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');

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
        args = args.join(' ').split('|');

        const friendly = args[0];
        const role = args[1];

        if (!message.guild.roles.find(guildRole => guildRole.name === role)) {
            Guild.createRole(role)
                .then(roleInstance => {
                    message.reply(`new role added in Discord: ${roleInstance}`);

                    // then add to database
                    Language.add(friendly, role).then(() => {
                        message.reply(`new role added in the database: ${role}`);
                    }).catch(error => {
                        Logger.exception(error);
                        message.reply(`new role couldn't be added in the database: ${role}`);
                    });
                }).catch(error => {
                    Logger.exception(error);
                    message.reply(`new role couldn't be added in Discord: ${role}`);
                });
        } else {
            message.channel.send(`The role ${role} already exists.`);
        }
    }
};
