const Config = require('../../config.json');
const Guild = require('../guild');
const MemberRolesFlow = require('../member-roles-flow');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    if (message.guild === null || message.channel.id !== Config.channels.welcome) {
        return;
    }

    const member = message.member;

    Guild.botChannel.send(`${member} semble avoir besoin d'aide dans <#${Config.channels.welcome}>.\n${message.url}`);
    MemberRolesFlow.answerWithNextStep(message, member);
};
