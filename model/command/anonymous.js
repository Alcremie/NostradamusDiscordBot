const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../../config.json');
const EmojiCharacters = require('../../emoji-characters.json');
const Guild = require('../guild');
const EventsBus = require('../events-bus');

let member = null;
let channel = null;

const FRENCH = 'french';
const ENGLISH = 'english';
let language = null;

const ADMIN = 'admin';
const MOD = 'mod';
let recipient = null;

const fourthStep = async (collection) => {
    let message = null;
    let answer = {};

    if (collection.size > 0) {
        message = collection.first();
    }

    if (message === null) {
        answer[ENGLISH] = 'It seems that you didn\'t send any message. Anonymous message request cancelled. You can try again anytime by sending the command `' + Config.prefix + 'anonymous`.';
        answer[FRENCH] = 'On dirait que tu n\'as envoyé aucun message. Demande d\'envoi de message anonyme annulée. Tu peux réessayer quand tu veux en envoyant la commande `' + Config.prefix + 'anonymous`.';

        EventsBus.dispatch('member.ignoreDMEnd', member);
    } else {
        let recipientChannel = Guild.anonymousMessagesChannel;

        if (recipient === ADMIN) {
            recipientChannel = await bot.users.get(Config.admin).createDM();
        }

        recipientChannel.send(
            `Someone sent an anonymous message:\n\n${message.content}`,
            {
                files: message.attachments.map(messageAttachment => {
                    return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
                })
            }
        ).then(() => {
            answer[ENGLISH] = 'Your message have been successfully and anonymously sent!';
            answer[FRENCH] = 'Ton message anonyme a été envoyé avec succès !';

            channel.send(answer[language]);
            EventsBus.dispatch('member.ignoreDMEnd', member);
        }).catch((exception) => {
            Logger.exception(exception);
            Guild.botChannel.send('An anonymous message could not be sent! Please contact Lily so she can check the logs!');

            answer[ENGLISH] = 'There was a problem sending your message and we are aware of it. Please try again later.';
            answer[FRENCH] = 'Il y a eu un problème lors de l\'envoi de votre message et nous avons été mis au courant. Veuillez réessayer plus tard.';

            channel.send(answer[language]);
            EventsBus.dispatch('member.ignoreDMEnd', member);
        });
    }
};

const thirdStep = async (collection) => {
    if (collection.size < 1) {
        EventsBus.dispatch('member.ignoreDMEnd', member);
        return;
    }

    recipient = collection.first().emoji.name === EmojiCharacters[1] ? ADMIN : MOD;

    const answer = {};
    const filter = (message) => {
        return message.author.id === member.user.id;
    };

    answer[ENGLISH] = 'Gotcha! You can now write your message. I will only send the first one though! Make sure to say all you have to say in only one message. Also, the recipients will not be able to answer you since it\'s anonymous. If you need an answer, you should explain in your message how they can answer you, knowing that they won\'t know who you are. You have thirty minutes to write it :) .';
    answer[FRENCH] = 'Pigé ! Tu peux maintenant écrire ton message. Je n\'enverrai cependant que le premier ! Assure-toi de dire tout ce que tu as à dire en un seul message. Aussi, les destinataires ne seront pas capables de te répondre étant donné que c\'est anonyme. Si tu as besoin d\'une réponse, tu devrais expliquer dans ton message comment ils peuvent te répondre, sachant qu\'ils ne savent pas qui tu es. Tu as trente minutes pour l\'écrire :) .';

    await channel.send(answer[language]);

    // 30 minutes
    channel.awaitMessages(filter, { time: 1800000, max: 1 }).then(fourthStep).catch(Logger.exception);
};

const secondStep = async (collection) => {
    if (collection.size < 1) {
        EventsBus.dispatch('member.ignoreDMEnd', member);
        return;
    }

    language = collection.first().emoji.name === EmojiCharacters[1] ? ENGLISH : FRENCH;

    const question = {};
    const filter = (reaction, user) => {
        const emoji = reaction.emoji.name;
        return (emoji === EmojiCharacters[1] || emoji === EmojiCharacters[2]) && user.id === member.user.id;
    };

    question[ENGLISH] = 'Who do you want to send your anonymous message to? (click on the right reaction below)\n\n:one: To the admin\n:two: To the mods';
    question[FRENCH] = 'À qui veux-tu envoyer ton message anonyme ? (clique sur la bonne réaction ci-dessous)\n\n:one: À l\'admin\n:two: Aux modos';

    const secondStepMessage = await channel.send(question[language]);

    // 5 minutes
    secondStepMessage.awaitReactions(filter, { time: 300000, max: 1 }).then(thirdStep).catch(Logger.exception);

    await secondStepMessage.react(EmojiCharacters[1]);
    await secondStepMessage.react(EmojiCharacters[2]);
};

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    member = Guild.getMemberFromMessage(message);
    channel = message.channel;

    if (member === null) {
        message.reply('sorry, you do not seem to be on the server.');
        return;
    }

    if (message.guild !== null) {
        message.reply('to submit an anonymous request, write this command in my DMs!');
    } else {
        EventsBus.dispatch('member.ignoreDMStart', member);

        const filter = (reaction, user) => {
            const emoji = reaction.emoji.name;
            return (emoji === EmojiCharacters[1] || emoji === EmojiCharacters[2]) && user.id === member.user.id;
        };

        /** {Message} firstStepMessage */
        const firstStepMessage = await channel.send(
            'Should I speak French or English? (click on the right reaction below)\n' +
            'Est-ce que je devrais parler français ou anglais ? (clique sur la bonne réaction ci-dessous)\n\n' +
            ':one: Anglais // English\n' +
            ':two: Français // French'
        );

        // 5 minutes
        firstStepMessage.awaitReactions(filter, { time: 300000, max: 1 }).then(secondStep).catch(Logger.exception);

        await firstStepMessage.react(EmojiCharacters[1]);
        await firstStepMessage.react(EmojiCharacters[2]);
    }
};
