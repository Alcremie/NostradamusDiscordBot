const Config = require('../../config.json');
const Guild = require('../guild');
const Country = require('../country');
const MemberRolesFlow = require('../member-roles-flow');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (message.guild === null || message.channel.id !== Config.channels.welcome) {
        return;
    }

    const member = message.member;
    const country = args.join(' ').toLowerCase().trim();

    if (country !== '') {
        const rolesToRemove = member.roles.array().filter(role => {
            return Country.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noCountry
        });
        const roleName = Country.getRoleNameFromString(country);
        let role = Guild.getRoleByName(roleName);

        if (role === null) {
            Guild.botChannel.send(`Country tag request by ${member.user.username}: ${country}\n${message.url}`);
            role = Config.roles.noCountry;
        }

        if (rolesToRemove.length > 0) {
            await member.removeRoles(rolesToRemove);
        }

        member.addRole(role).then(member => {
            MemberRolesFlow.answerWithNextStep(message, member);
        });
    } else {
        let reply = '\n';

        reply += '\nYou need to enter in a country. The command `!country` alone does not tell me which country you currently live in. For example: `!country United States`';
        reply += '\nIl faut que tu spécifies un pays. La commande `!country` seule ne me permet pas de savoir quel est le pays dans lequel tu vis. Par exemple : `!country France`';

        message.reply(reply);
    }
};
