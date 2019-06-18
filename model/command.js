const fs = require('fs');
const Config = require('../config.json');
const commandAliases = {
    'reboot': 'reload',
    'level': 'french',
    'rank': 'french',
    'pays': 'country',
    'langue': 'language',
    'langage': 'language',
    'rp': 'report',
    'rep': 'report',
    'miniclass': 'mini-class',
    'loadroles': 'load-roles',
    'modlist': 'mod-list',
    'comite': 'comitee',
    'comité': 'comitee',
    'addlanguage': 'add-language',
    'addcountry': 'add-country',
    'setavatar': 'set-avatar',
    'dictee': 'dictation',
    'dictée': 'dictation',
};

const Command = {
    /**
     * @param {Message} message
     * @returns {boolean}
     */
    parseMessage: (message) => {
        let isCommand = false;

        if (message.content.toLowerCase().substr(0, Config.prefix.length) === Config.prefix) {
            let content = message.content.substr(Config.prefix.length).trim().split(' ');
            const command = content.shift().toLowerCase();

            if (Command.isValid(command)) {
                isCommand = true;

                if (commandAliases.hasOwnProperty(command)) {
                    (require('./command/' + commandAliases[command].toLowerCase() + '.js'))(message, content);
                } else {
                    (require('./command/' + command + '.js'))(message, content);
                }
            }
        }

        return isCommand;
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
