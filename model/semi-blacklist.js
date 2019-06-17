const Guild = require('./guild');

const SemiBlacklist = {
    /** {Array} */
    words: require('../semi-blacklist.json'),

    /**
     * @param {Message} message
     */
    parseMessage: async (message) => {
        if (message.guild !== null) {
            const messageWords = message.content.toLowerCase().split(' ');
            const triggered = messageWords.some(
                word => SemiBlacklist.words.some(
                    blackWord => word.match(new RegExp(blackWord)) !== null
                )
            );

            if (triggered) {
                Guild.automodChannel.send(
                    `Semi-blacklist triggered by ${message.author} in ${message.channel}\n${message.url}`,
                    Guild.messageToEmbed(message)
                )
            }
        }
    },
};

module.exports = SemiBlacklist;
