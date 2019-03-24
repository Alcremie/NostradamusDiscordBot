const Discord = require('discord.js');
const Config = require('./config');
const Server = require('./server');
const commands = require('./commands');
const User = require('./user');
const Channel = require('./channel');
const Spreadsheets = require('./spreadsheets');

const bot = new Discord.Client();
const semiBlacklist = require('./semi-blacklist.json').map(term => {
    return `^${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/%/g, '[^\\s]*').toLowerCase()}$`;
});
const memberMessageMap = new Discord.Collection();

const deleteMessageIfTooOld = (message) => {
    const tooOld = Date.now() - message.createdTimestamp >= 3 * 24 * 60 * 60 * 1000;

    if (tooOld) {
        message.delete().catch(console.error);
    }

    return tooOld;
};

const addMessageFromWelcomeToMap = (message) => {
    if (message.author.bot === false) {
        if (!memberMessageMap.has(message.author.id)) {
            memberMessageMap.set(message.author.id, []);
        }

        memberMessageMap.set(
            message.author.id,
            memberMessageMap.get(message.author.id).concat(message.id)
        );
    }

    let mentions = message.mentions.members.concat(message.mentions.users);
    mentions.delete(message.author.id);

    if (mentions.size > 0) {
        mentions.map(user => {
            if (!memberMessageMap.has(user.id)) {
                memberMessageMap.set(user.id, []);
            }

            memberMessageMap.set(
                user.id,
                memberMessageMap.get(user.id).concat(message.id)
            );
        });
    }
};

global.clearWelcomeMessagesForMember = (memberId) => {
    if (memberMessageMap.has(memberId)) {
        Channel.welcomeChannel.bulkDelete(memberMessageMap.get(memberId)).catch(console.error);
        memberMessageMap.delete(memberId);
    }
};

global.bot = bot;

require('./moderation-log');

const crashRecover = (exception) => {
    console.log('I crashed. I CRASHED D: !');
    console.log('----');
    console.log(exception);
    console.log('----');

    bot.destroy().then(() => {
        bot.once('ready', () => {
            Channel.logInChannel('Just recovered from a crash, folks. Not dead yet! Oh, wanna know about what happened? Well, if you can understand it, read the message below.');
            Channel.logInChannel('```' + exception + '```');
        });

        bot.login(Config.BOT_TOKEN.live).catch((exception) => {
            setTimeout(() => {
                crashRecover(exception);
            }, 10000);
        });
    });
};

process.on('uncaughtException', (exception) => {
    if (typeof bot === 'undefined') {
        console.log('Crashed at an unknown position. This is weird. This shouldn\'t happen. SEND HALP!');
        console.log('----');
        console.log(exception);
        console.log('----');
    } else {
        crashRecover(exception);
    }
});

bot.on('error', crashRecover);

bot.on("message", msg => {
    if (msg.channel.id === Channel.welcomeChannel.id) {
        addMessageFromWelcomeToMap(msg);
    }

    if (msg.author.bot || (Config.ADMIN_MODE && !msg.member.user.roles.exists(userRole => userRole.id === Server.admin))) {
    	return;
    }

    let prefix = commands.prefix;
    let content = msg.content;
    const words = content.toLowerCase().split(' ');
    const semiBlacklistTriggered = words.some(
        word => semiBlacklist.some(
            blackWord => word.match(new RegExp(blackWord)) !== null
        )
    );

	if (msg.channel.type === 'dm' && !content.startsWith(prefix)) {
        commands.dmSent(content, msg);
        return;
    }

	if (msg.guild !== null && semiBlacklistTriggered) {
        Channel.automodChannel.send(
            `<@141288766760288256>\nSemi-blacklist triggered by ${msg.author} in ${msg.channel}\n${msg.url}`,
            Channel.messageToEmbed(msg)
        );
    }

    if (Spreadsheets.ready) {
        Spreadsheets.incrementNumberMessages();
    }

    if (!content.startsWith(prefix)) {
	    return;
    }

    let command = content.toLowerCase().substr(prefix.length);
    let commandArgs = command.split(' ');

    // For single argument commands, only allow one space.
    // If more than one space, assume argument is multi-word
    let arg = commandArgs.slice(1).join(' ');

    // in case user puts []'s around the tag
    if (arg.startsWith('[') && arg.endsWith(']')) {
        arg = arg.slice(1, -1);
    }

    arg = arg.trim();

	if (msg.channel.type === 'dm') {
		if (command.startsWith('suggest')) {
			commands.addSuggestion(arg, msg);
		}

		return;
	}

	const inModerationChannel = msg.channel.parentID === '361961604402774016';
	const inRoleSettingChannel = msg.channel.name === 'bienvenue' || inModerationChannel;

	if (inRoleSettingChannel && (command.startsWith('french') || command.startsWith('level'))) {
		commands.setFrenchLevel(arg, msg);
	} else if (inRoleSettingChannel && (command.startsWith('language') || command.startsWith('native'))) {
		commands.setNativeLanguage(arg, msg);
	} else if (inRoleSettingChannel && (command.startsWith('origin') || command.startsWith('country'))) {
		commands.setCountry(arg, msg);
	} else if (command.startsWith('mini-class') || command.startsWith('miniclass')) {
		commands.setMiniClassRole(msg);
	} else if (command.startsWith('rep') || command.startsWith('rp')) {
		commands.reportMember(arg, msg);
	} else if (inModerationChannel && (command.startsWith('warntroll') || command.startsWith('trollwarn'))) {
		commands.warnTroll(arg, msg);
	} else if (inRoleSettingChannel && (command.startsWith('list'))) {
		commands.getList(arg, msg);
	} else if (command.startsWith('suggest')) {
		commands.warnSuggestion(arg, msg);
	} else if (command.startsWith('tag')) {
		// for admins only:
		if (User.hasModRole(msg.member) && msg.mentions) {
			arg = commandArgs.slice(1, -1).join(' ');
			commands.tagUser(arg, msg);
		}
	} else if (command.startsWith('setavatar')) {
        // for admins only:
        if (User.hasModRole(msg.member) && msg.mentions) {
            commands.setAvatar(arg, msg, bot);
        }
    } else if (inRoleSettingChannel && (command.startsWith('help'))) {
		msg.channel.send(`
\`\`\`
!french [beginner|intermediate|advanced|native]
!language [language]
!country [country]
!list countries
!list languages
\`\`\`
		`);
	}

    // admin only

	// case sensitive
    let commandArgsCS = content.split(' ');
    const argCS = commandArgsCS.slice(1).join(' ');

    //RMMTMP
    if(msg.member === null && msg.guild.member(msg.author) === null){
        Channel.logInChannel("msg.member is null, which is needed to check hasModRole.");
        Channel.logInChannel("This is the message author: " + msg.author);
        Channel.logInChannel("This is the message object: " + msg);
    }


    if (User.hasModRole(msg.member !== null ? msg.member : msg.guild.member(msg.author))) {
    	const terms = argCS.split('|');
		const english = terms[0];
		const french = terms[1];

		if (command.startsWith('addlanguage')) {
			commands.addNewRole(english, french, 'languages', msg);
		} else if (command.startsWith('addcountry')) {
			commands.addNewRole(english, french, 'countries', msg);
		} else if (command.startsWith('load')) {
			commands.loadRoles(msg);
		}
     }
});

bot.on("guildMemberAdd", (member) => {
    // add New role
	if (typeof(Channel.welcomeChannel.send) !== 'function') {
        Channel.logInChannel('Couldn\'t send to ' + Channel.welcomeChannel + 'because send is ' + Channel.welcomeChannel.send);
	    Channel.logInChannel('The channel is this:' + Channel.welcomeChannel);
    }

    let frenchMessage = `**Bienvenue sur le serveur Discord officiel de /r/French, ${member.user} !\nPour pouvoir écrire dans les autres salons, veuillez suivre ces instructions.**`;
    let englishMessage = `**Welcome to the official /r/French Discord, ${member.user}!\\nTo be able to send messages in the other channels, please follow these instructions.**`;

    frenchMessage += '\n\nPour commencer, il faut que tu précises ton niveau en français en tapant dans le chat la commande `!french` suivie de ton niveau. Les niveaux sont débutant, intermédiaire, avancé et natif. Par exemple: `!french intermédiaire`';
    englishMessage += '\n\nFor starters, you need to specify your proficiency in French by typing the command `!french` in the chat followed by your level. The available levels are beginner, intermediate, advanced and native. For example: `!french intermediate`';

    Channel.welcomeChannel.send(englishMessage + '\n\n' + frenchMessage);
});

bot.on('guildMemberRemove', async (member) => {
    global.clearWelcomeMessagesForMember(member.user.id);
});

bot.on('ready', async () => {
    Channel.retrieveChannels(bot);
    Channel.logInChannel('I am ready!');

    const welcomeMessages = await Channel.welcomeChannel.fetchMessages();

    welcomeMessages.map(message => {
        if (!deleteMessageIfTooOld(message)) {
            addMessageFromWelcomeToMap(message);
        }
    });

    memberMessageMap.map(messages => Array.from(new Set(messages)));

    setInterval(async () => {
        const welcomeMessages = await Channel.welcomeChannel.fetchMessages();

        welcomeMessages.map(message => {
            deleteMessageIfTooOld(message);
        });
    }, 60 * 60);
});

bot.on('disconnect', () => {
	Channel.logInChannel("I'm disconnecting now (uptime: " + bot.uptime + ")");
});

bot.on('warn', (info) => {
	Channel.logInChannel("Warning (uptime: " + bot.uptime + "): "+info);
});

bot.login(Config.BOT_TOKEN.live);
