const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    if (message.guild === null) {
        message.reply('sorry, that command can only be executed on the server.');
        return;
    }

    message.delete().catch(Logger.exception);
    const member = message.member;
    let {certain, foundMembers} = Guild.findDesignatedMemberInMessage(message);

    const certaintySentence = certain ? `\n\nThe reported members are: ` : (foundMembers.length > 0 ? `\n\nI'm not sure about who was reported, but here is a guess: ` : ``);
    foundMembers = foundMembers
        .map(member => `${member} (\`${member.user.username}#${member.user.discriminator}\`${member.nickname !== null ? ` aka \`${member.nickname}\`` : ``})`)
        .join(', ');

    Guild.automodChannel.send(
        `@everyone, ${member} made a report.${certaintySentence}${foundMembers}\n${message.url}`,
        Guild.messageToEmbed(message)
    );
};
