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

    if (Guild.isMemberMod(member)) {
        let {certain, foundMembers} = Guild.findDesignatedMemberInMessage(message);
        let answer = '';
        let userId = 'ID';
        let warnMessageEn = ``;
        let warnMessageFr = ``;

        warnMessageEn += `trolling on the ${Guild.discordGuild.name} server. `;
        warnMessageEn += `If you do not change your behavior, you will be banned.`;

        warnMessageFr += `troll sur le serveur ${Guild.discordGuild.name}. `;
        warnMessageFr += `Si vous ne changez pas de comportement, vous serez banni.`;

        if (foundMembers.length > 0) {
            if (!certain) {
                answer = `I'm not sure about who you want to warn, but guess it's ${foundMembers[0]}. If that's not correct, please change the ID in the command below accordingly.`;
            }

            userId = foundMembers[0].user.id;
        } else {
            answer += `I didn't understand who you wanted to warn, so I will just write "<@ID>" in the command below.`
        }

        answer += `\n\nPlease copy one of the commands below, depending on the warned member's language, and send it in the ${Guild.modLogChannel} channel.\n`;
        answer += `\`\`\`${Config.warnCommand.replace('%id', userId).replace('%reason', warnMessageEn)}\`\`\``;
        answer += `\`\`\`${Config.warnCommand.replace('%id', userId).replace('%reason', warnMessageFr)}\`\`\``;

        message.reply(answer);
    }
};
