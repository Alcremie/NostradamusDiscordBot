const Discord = require("discord.js");
const Config = require('./config');
const Server = require('./server');
const commands = require('./commands');
const User = require('./user');
const Channel = require('./channel');
const Spreadsheets = require('./spreadsheets');

const semiBlacklist = require('./semi-blacklist.json');
const bot = new Discord.Client();
global.bot = bot;

process.on('uncaughtException', (exception) => {
    if (typeof bot === 'undefined') {
        console.log('Crashed at an unknown position. This is weird. This shouldn\'t happen. SEND HALP!');
        console.log('----');
        console.log(exception);
        console.log('----');
    } else {
        console.log('I crashed. I CRASHED D: !');
        console.log('----');
        console.log(exception);
        console.log('----');

        bot.destroy().then(() => {
            bot.once('ready', () => {
                Channel.logInChannel('Just recovered from a crash, folks. Not dead yet! Oh, wanna know about what happened? Well, if you can understand it, read the message below.');
                Channel.logInChannel('```' + exception + '```');
            });

            bot.login(Config.BOT_TOKEN.live);
        });
    }
});

bot.on("message", msg => {
    if(msg.author.bot || (Config.ADMIN_MODE && !msg.member.user.roles.exists(userRole => userRole.id === Server.admin))) {
    	return;
    }

    let prefix = commands.prefix;
    let content = msg.content;
    const words = content.toLowerCase().split(' ');
    const semiBlacklistTriggered = words.some(word => semiBlacklist.some(blackWord => word.indexOf(blackWord) > -1));

	if (msg.channel.type === 'dm' && !content.startsWith(prefix)) {
        commands.dmSent(content, msg);
        return;
    }

	if (msg.guild !== null && semiBlacklistTriggered) {
        Channel.botChannel.send(
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

	const inRoleSettingChannel = msg.channel.name === 'bienvenue' || msg.channel.parentID === '361961604402774016';

	if (inRoleSettingChannel && (command.startsWith('french') || command.startsWith('level'))) {
		commands.setFrenchLevel(arg, msg);
	} else if (inRoleSettingChannel && (command.startsWith('language') || command.startsWith('native'))) {
		commands.setNativeLanguage(arg, msg);
	} else if (inRoleSettingChannel && (command.startsWith('origin') || command.startsWith('country'))) {
		commands.setCountry(arg, msg);
	} else if (command.startsWith('mini-class') || command.startsWith('miniclass')) {
		commands.setMiniClassRole(msg);
	}  else if (inRoleSettingChannel && (command.startsWith('list'))) {
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

	Channel.welcomeChannel.send(`**Welcome to the official /r/French Discord, ${member.user}!\nTo be able to send messages in the other channels, please follow these instructions.**\n\n**Bienvenue sur le serveur Discord officiel de /r/French !\nPour pouvoir écrire dans les autres salons, veuillez suivre ces instructions.**`);

    const frenchMessage = 'Pour commencer, il faut que tu précises ton niveau en français en tapant dans le chat la commande `!french` suivie de ton niveau. Les niveaux sont débutant, intermédiaire, avancé et natif. Par exemple: `!french intermédiaire`';
    const englishMessage = 'For starters, you need to specify your proficiency in French by typing the command `!french` in the chat followed by your level. The available levels are beginner, intermediate, advanced and native. For example: `!french intermediate`';

    Channel.welcomeChannel.send(englishMessage + '\n\n' + frenchMessage);
});

bot.on('ready', () => {
    Channel.retrieveChannels(bot);
    Channel.logInChannel('I am ready!');
});

bot.on('disconnect', () => {
	Channel.logInChannel("I'm disconnecting now (uptime: " + bot.uptime + ")");
});

bot.on('warn', (info) => {
	Channel.logInChannel("Warning (uptime: " + bot.uptime + "): "+info);
});

bot.login(Config.BOT_TOKEN.live);
