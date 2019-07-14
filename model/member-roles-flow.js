const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../config.json');
const Guild = require('./guild');

const STEPS = [
    'level',
    'nativeLanguage',
    'country'
];

const MemberRolesFlow = {
    /**
     * @param {Message} message
     * @param {GuildMember} member
     */
    answerWithNextStep: (message, member) => {
        const nextStep = MemberRolesFlow.getNextStepsForMember(member);
        let reply;

        if (nextStep !== null) {
            const callback = 'get' + nextStep.substr(0, 1).toUpperCase() + nextStep.substr(1) + 'StepMessage';
            message.reply(MemberRolesFlow[callback](Guild.isMemberNative(member)));
        } else {
            setTimeout(() => Guild.clearWelcomeMessagesForMember(member), 5000);
            member.addRole(Config.roles.officialMember);

            reply = 'You can now post on the other channels :D ! If that\'s not the case, call a moderator. // Tu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, contacte un modérateur.';
            reply += `\nIf you feel lost, you can say hi in <#${Config.channels.beginner}>. // Si tu te sens perdu, tu peux dire bonjour dans <#${Config.channels.beginner}>.\n`;
            reply += '\nTu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, appelle un modérateur.';
            reply += `\nSi tu te sens perdu, tu peux dire bonjour dans <#${Config.channels.learntLanguage}>.`;

            member.user.send(reply).catch(Logger.exception);
        }
    },

    /**
     * @param {GuildMember} member
     * @returns {string}
     */
    getNextStepsForMember: (member) => {
        let nextStep = null;

        for (let step of STEPS) {
            const callback = 'is' + step.substr(0, 1).toUpperCase() + step.substr(1) + 'Needed';

            if (MemberRolesFlow[callback](member)) {
                nextStep = step;
                break;
            }
        }

        return nextStep;
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isLevelNeeded: (member) => {
        return !Guild.memberHasLevelRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isNativeLanguageNeeded: (member) => {
        return !Guild.isMemberNative(member) && !Guild.memberHasLanguageRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isCountryNeeded: (member) => {
        return !Guild.memberHasCountryRole(member);
    },

    /**
     * @returns {string}
     */
    getLevelStepMessage: () => {
        const command = Config.prefix + Config.levelCommand;
        const frenchMessage = 'Il faut maintenant que tu précises ton niveau en ' + Config.learntLanguage.french + ' en tapant la commande `' + command + '` suivie de ton niveau. Les niveaux sont débutant, intermédiaire, avancé et natif. Par exemple: `' + command + ' intermediaire`';
        const englishMessage = 'You now need to specify your proficiency in ' + Config.learntLanguage.english + ' by typing the command `' + command + '` followed by your level. The available levels are beginner, intermediate, advanced and native. For example: `' + command + ' intermediate`';

        return '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },

    /**
     * @returns {string}
     */
    getNativeLanguageStepMessage: () => {
        const frenchMessage = 'Il faut maintenant que tu précises ta langue natale en tapant la commande `' + Config.prefix + 'language` suivie de ta langue. Par exemple: `' + Config.prefix + 'language french`';
        const englishMessage = 'You now need to specify your native language by typing the command `' + Config.prefix + 'language` followed by your language. For example: `' + Config.prefix + 'language english`';

        return '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },

    /**
     * @returns {string}
     */
    getCountryStepMessage: () => {
        const frenchMessage = 'Il faut maintenant que tu précises le pays dans lequel tu vis en tapant la commande `' + Config.prefix + 'country` suivie du pays. Par exemple: `' + Config.prefix + 'country France`. Tu as le droit - si tu ne veux pas dévoiler cette information - de taper la commande `' + Config.prefix + 'country Pays inconnu`.';
        const englishMessage = 'You now need to specify the country you\'re currently living in by typing the command `' + Config.prefix + 'country` followed by the country. For example: `' + Config.prefix + 'country United States`. You have the right to - if you do not want to give away that information - type the command `' + Config.prefix + 'country Unknown country`.';

        return '\n\n' + englishMessage + '\n\n' + frenchMessage;
    }
};

module.exports = MemberRolesFlow;