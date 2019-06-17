const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');
const Country = require('../country');

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
        const dryRun = args[0] === 'dry';
        let amoutRolesCreated = 0;

        for (let i = 0; i < Language.list.length; i++) {
            if (!message.guild.roles.find(role => role.name === Language.list[i].role)) {
                amoutRolesCreated++;

                if (dryRun) {
                    message.reply(`would create role ${Language.list[i].role}`);
                } else {
                    Guild.createRole(Language.list[i].role)
                        .then(role => message.reply(`created role ${role}`))
                        .catch(Logger.exception)
                }
            }
        }

        for (let i = 0; i < Country.list.length; i++) {
            if (!message.guild.roles.find(role => role.name === Country.list[i].role)) {
                amoutRolesCreated++;

                if (dryRun) {
                    message.reply(`would create role ${Country.list[i].role}`);
                } else {
                    Guild.createRole(Country.list[i].role)
                    .then(role => message.reply(`created role ${role}`))
                    .catch(Logger.exception)
                }
            }
        }

        message.reply(`found ${amoutRolesCreated} role${amoutRolesCreated > 1 ? 's' : ''} that need to be created`);
    }
};
