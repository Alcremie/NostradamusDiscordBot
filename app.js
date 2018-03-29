const Discord = require("discord.js");
const Config = require('./config');
const Server = require('./server');
const commands = require('./commands');
const User = require('./user');
const Channel = require('./channel');

const bot = new Discord.Client();

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
    if(msg.author.bot || (Config.ADMIN_MODE && !msg.member.user.roles.exists('id', Server.admin))) {
    	return;
    }

    let prefix = commands.prefix;
    let content = msg.content;

	if (msg.channel.type === 'dm') {
        if (!content.startsWith(prefix)) {
            commands.dmSent(content, msg);
        	return;
		}
    }

    if (!content.startsWith(prefix)) {
	    return;
    }

    let command = content.toLowerCase().substr(prefix.length);
    let commandArgs = command.split(' ');

    if (!command) {
        return;
    }

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

	if (command.startsWith('french') || command.startsWith('level')) {
		commands.setFrenchLevel(arg, msg);
	} else if (command.startsWith('language') || command.startsWith('native')) {
		commands.setNativeLanguage(arg, msg);
	} else if (command.startsWith('origin') || command.startsWith('country')) {
		commands.setCountry(arg, msg);
	} else if (command.startsWith('mini-class') || command.startsWith('miniclass')) {
		commands.setMiniClassRole(msg);
	}  else if (command.startsWith('list')) {
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
    } else if (command.startsWith('help')) {
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
    if(msg.member === null){
        Channel.logInChannel("msg.member is null, which is needed to check hasModRole.");
        Channel.logInChannel("This is the message author: " + msg.author);
        Channel.logInChannel("This is the message object: " + msg);
    }


    if (User.hasModRole(msg.member)) {
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

	Channel.welcomeChannel.send(`**Welcome to the official /r/French Discord, ${member.user}! To send messages in the other channels, please follow these instructions to set your proficiency in French, native language (if not French), and country.** \n\n **Bienvenue sur le serveur Discord officiel de /r/French ! Pour participer aux autres salons, veuillez suivre ces instructions pour vous mettre les tags de niveau de français, langue maternelle et pays d'origine.**\n\n`);
    Channel.welcomeChannel.send(`

1. Set your proficiency in French. / Indiquez votre niveau en français.
\`\`\`
!french [beginner|intermediate|advanced|native]

Example / Exemple: !french intermediate
\`\`\`
2. Choose your native language. (If French, skip this step.) / Indiquez votre langue maternelle. (Si vous êtes francophone natif, passez cette étape.)
\`\`\`
!language [language]

Example / Exemple: !language english
\`\`\`
3. Indicate your country. / Indiquez votre pays.
\`\`\`
!country [country]

Example / Exemple: !country united states
\`\`\`
*To get a list of countries or languages: / Pour avoir la liste des pays ou des langues :*
\`\`\`
!list countries
!list languages
\`\`\`
*If your country or language is not listed: / Si votre pays ou langue ne se trouve pas dans la liste :*
\`\`\`
!language [yourlanguagehere] or !country [yourcountryhere]
\`\`\`

*If you still cannot send messages in the other channels after tagging yourself, please message or tag one of the moderators.* \n\n *Si, après vous être tagué, vous ne pouvez toujours pas envoyer de message dans les autres salons, veuillez mentionner un modérateur ou lui envoyer un message privé.*
    `);
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
