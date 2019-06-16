const Config = require('../../config.json');
const Guild = require('../guild');
const Language = require('../language');
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
    const language = args.join(' ').toLowerCase();

    if (Language.getNameList().indexOf(language)) {
        let rolesToRemove = member.roles.array().filter(role => {
            return Language.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noLanguage;
        });
        const roleName = Language.getRoleNameFromString(language);
        let role = Guild.getRoleByName(roleName);

        if (role === null) {
            Guild.botChannel.send(`Language tag request by ${member.user.username}: ${language}\n${message.url}`);
            role = Config.roles.noLanguage;
        } else if (role.id === Config.roles.native) {
            rolesToRemove = rolesToRemove.concat(member.roles.array().filter(
                role => Object.values(Guild.frenchLevelRoles).indexOf(role.name) > -1
            ));
        }

        if (rolesToRemove.length > 0) {
            await member.removeRoles(rolesToRemove);
        }

        member.addRole(role).then(member => {
            MemberRolesFlow.answerWithNextStep(message, member);
        });
    }
};
