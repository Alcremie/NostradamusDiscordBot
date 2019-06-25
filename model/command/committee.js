const Config = require('../../config.json');
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

    let list = message.guild.members.filter(
        member => member.roles.has(Config.roles.committee)
    ).map(
        member => (member.nickname !== null ? member.nickname : member.user.username) + '#' + member.user.discriminator
    );

    message.reply(`there are currently ${list.length} member in the Decision Committee:\n\n${list.join('\n')}`);
};
