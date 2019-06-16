const Config = require('../config.json');
const Guild = require('./guild');

const STEPS = [
    'frenchLevel',
    'nativeLanguage',
    'country'
];

const MemberRolesFlow = {
    /**
     * @param {Message} message
     * @param {GuildMember} member
     */
    rolesUpdated: (message, member) => {
        const nextStep = MemberRolesFlow.getNextStepsForMember(member);
        let reply;

        if (nextStep !== null) {
            const callback = 'get' + nextStep.substr(0, 1).toUpperCase() + nextStep.substr(1) + 'StepMessage';
            message.reply(MemberRolesFlow[callback](Guild.isMemberFrenchNative(member)));
        } else {
            // @TODO Clear welcome messages

            member.addRole(Config.roles.officialMember);

            if (Guild.isMemberFrenchNative(member)) {
                reply = 'Tu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, appelle un modérateur.';
                reply += `\nSi tu te sens perdu, tu peux dire bonjour dans <#${Config.channels.french}>.`;
            } else {
                reply = 'You can now post on the other channels :D ! If that\'s not the case, call a moderator. // Tu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, contacte un modérateur.';
                reply += `\nIf you feel lost, you can say hi in <#${Config.channels.frenchBeginner}>. // Si tu te sens perdu, tu peux dire bonjour dans <#${Config.channels.frenchBeginner}>.`;
            }

            member.user.send(reply);
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
    isFrenchLevelNeeded: (member) => {
        return !Guild.memberHasFrenchLevelRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isNativeLanguageNeeded: (member) => {
        return !Guild.isMemberFrenchNative(member) && !Guild.memberHasLanguageRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isCountryNeeded: (member) => {
        return !Guild.memberHasCountryRole(member);
    },

    /**
     * @param {boolean} isFrenchNative
     * @returns {string}
     */
    getFrenchLevelStepMessage: (isFrenchNative) => {
        const example = isFrenchNative ? '`!french natif`' : '`!french intermediate`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ton niveau en français en tapant la commande `!french` suivie de ton niveau. Les niveaux sont débutant, intermédiaire, avancé et natif. Par exemple: ' + example;
        const englishMessage = 'Thank you! Now, you need to specify your proficiency in French by typing the command `!french` followed by your level. The available levels are beginner, intermediate, advanced and native. For example: ' + example;

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },

    /**
     * @param {boolean} isFrenchNative
     * @returns {string}
     */
    getNativeLanguageStepMessage: (isFrenchNative) => {
        const example = isFrenchNative ? '`!language french`' : '`!language english`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ta langue natale en tapant la commande `!language` suivie de ta langue. Par exemple: ' + example;
        const englishMessage = 'Thank you! Now, you need to specify your native language by typing the command `!language` followed by your language. For example: ' + example;

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },

    /**
     * @param {boolean} isFrenchNative
     * @returns {string}
     */
    getCountryStepMessage: (isFrenchNative) => {
        const example = isFrenchNative ? '`!country France`' : '`!country United States`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ton pays en tapant la commande `!country` suivie de ton pays. Par exemple: ' + example + '. Tu as le droit - si tu ne veux pas dévoiler cette information - de taper la commande `!country Pays inconnu`.';
        const englishMessage = 'Thank you! Now, you need to specify your country by typing the command `!country` followed by your country. For example: ' + example + '. You have the right to - if you do not want to give away that information - type the command `!country Unknown country`.';

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    }
};

module.exports = MemberRolesFlow;