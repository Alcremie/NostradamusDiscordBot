const fs = require('fs');
const Config = require('../config');
const commandAliases = {
    'reboot': 'reload'
};

const Command = {
    /**
     * @param {Message} message
     */
    parseMessage: async (message) => {
        if (message.content.toLowerCase().substr(0, Config.prefix.length) === Config.prefix) {
            let content = message.content.substr(Config.prefix.length).trim().split(' ');
            const command = content.shift().toLowerCase();

            if (Command.isValid(command)) {
                if (commandAliases.hasOwnProperty(command)) {
                    (require('./command/' + commandAliases[command].toLowerCase() + '.js'))(message, content);
                } else {
                    (require('./command/' + command + '.js'))(message, content);
                }
            }
        }
    },

    /**
     * @param {string} command
     * @return {boolean}
     */
    isValid: (command) => {
        let valid = fs.existsSync('model/command/' + command.toLowerCase() + '.js');

        if (!valid && commandAliases.hasOwnProperty(command)) {
            valid = fs.existsSync('model/command/' + commandAliases[command].toLowerCase() + '.js');
        }

        return valid;
    }
};

module.exports = Command;
