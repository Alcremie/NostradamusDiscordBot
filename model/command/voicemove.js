const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = (message) => {
    let member;

    if (message.guild === null) {
        member = Guild.discordGuild.member(message.author);

        if (member === null) {
            message.reply('sorry, you do not seem to be on the server.');
            return;
        }
    } else {
        member = message.member;
    }

    if (Guild.isMemberMod(member)) {
        Guild.addMemberToVoiceStateUpdateWatcher(member.id, setTimeout(() => {
            Guild.removeMemberFromVoiceStateUpdateWatcher(member.id);
            message.reply('sorry, too slow!');
        }, 5 * 60 * 1000));

        message.reply('you can connect to another channel and I\'ll make the members follow you.');
    }
};
