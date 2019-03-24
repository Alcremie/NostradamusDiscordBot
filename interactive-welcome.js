const User = require('./user');

const InteractiveWelcome = {
    steps: [
        'frenchLevel',
        'nativeLanguage',
        'country'
    ],

    statusUpdated: function (message, canNowPost) {
        const guild = message.guild;
        const member = guild.member(message.author);
        const nextStep = this.getNextStepsForMember(member);
        let reply = '';

        if (nextStep !== null) {
            const callback = 'get' + nextStep.substr(0, 1).toUpperCase() + nextStep.substr(1) + 'StepMessage';
            reply += this[callback](User.isFrenchNative(member));
        }

        if (canNowPost) {
            global.clearWelcomeMessagesForMember(member.user.id);

            if (User.isFrenchNative(member)) {
                reply += '\nTu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, appelle un modérateur.';
                reply += '\nSi tu te sens perdu, tu peux dire bonjour dans <#254498368263290883>.'
            } else {
                reply += '\nYou can now post on the other channels :D ! If that\'s not the case, call a moderator. // Tu peux maintenant poster sur les autres canaux :D ! Si tu te rends compte que ce n\'est pas le cas, contacte un modérateur.';
                reply += '\nIf you feel lost, you can say hi in <#455779417290178560>. // Si tu te sens perdu, tu peux dire bonjour dans <#455779417290178560>.';
            }

            reply.trim();

            member.user.send(reply);
        } else {
            message.reply(reply);
        }
    },
    getNextStepsForMember: function (member) {
        let nextStep = null;

        for (let step of this.steps) {
            const callback = 'is' + step.substr(0, 1).toUpperCase() + step.substr(1) + 'Needed';

            if (this[callback](member))  {
                nextStep = step;
                break;
            }
        }

        return nextStep;
    },
    isFrenchLevelNeeded: function (member) {
        return !User.hasLevelRole(member);
    },
    isNativeLanguageNeeded: function (member) {
        return !User.isFrenchNative(member) && !User.hasLanguageRole(member);
    },
    isCountryNeeded: function (member) {
        return !User.hasCountryRole(member);
    },
    getFrenchLevelStepMessage: function(isFrenchNative) {
        const example = isFrenchNative ? '`!french natif`' : '`!french intermediate`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ton niveau en français en tapant la commande `!french` suivie de ton niveau. Les niveaux sont débutant, intermédiaire, avancé et natif. Par exemple: ' + example;
        const englishMessage = 'Thank you! Now, you need to specify your proficiency in French by typing the command `!french` followed by your level. The available levels are beginner, intermediate, advanced and native. For example: ' + example;

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },
    getNativeLanguageStepMessage: function(isFrenchNative) {
        const example = isFrenchNative ? '`!language french`' : '`!language english`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ta langue natale en tapant la commande `!language` suivie de ta langue. Par exemple: ' + example;
        const englishMessage = 'Thank you! Now, you need to specify your native language by typing the command `!language` followed by your language. For example: ' + example;

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    },
    getCountryStepMessage: function(isFrenchNative) {
        const example = isFrenchNative ? '`!country France`' : '`!country United States`';
        const frenchMessage = 'Merci ! Maintenant, il faut que tu précises ton pays en tapant la commande `!country` suivie de ton pays. Par exemple: ' + example + '. Tu as le droit - si tu ne veux pas dévoiler cette information - de taper la commande `!country Pays inconnu`.';
        const englishMessage = 'Thank you! Now, you need to specify your country by typing the command `!country` followed by your country. For example: ' + example + '. You have the right to - if you do not want to give away that information - type the command `!country Unknown country`.';

        return isFrenchNative ? frenchMessage : '\n\n' + englishMessage + '\n\n' + frenchMessage;
    }
};

module.exports = InteractiveWelcome;