const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('./guild');

const SemiBlacklist = {
    /**
     * @param {Message} message
     * @param {boolean} isCommand
     */
    parseMessage: async (message, isCommand) => {
        if (message.guild === null && !isCommand) {
            Guild.botChannel.send(
                `${message.author} sent a DM:\n\n${message.content}`,
                {
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
                    })
                }
            ).catch(Logger.exception);
        }
    },
};

module.exports = SemiBlacklist;
