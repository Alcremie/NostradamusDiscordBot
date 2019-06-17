const Logger = require('@elian-wonhalf/pretty-logger');

const mainProcess = () => {
    const ChildProcess = require('child_process');

    process.on('uncaughtException', Logger.exception);

    Logger.info('Spawning bot subprocess...');
    let botProcess = ChildProcess.spawn(process.argv[0], [process.argv[1], 'bot']);

    const stdLog = (callback) => {
        return (data) => {
            const reboot = data.toString().toLowerCase().indexOf('reboot') > -1;

            data = data.toString().replace(/\n$/, '').split('\n');
            data.map(datum => callback('|-- ' + datum));

            if (reboot) {
                botProcess.kill();
            }
        };
    };

    const bindProcess = (subprocess) => {
        subprocess.stdout.on('data', stdLog(console.log));
        subprocess.stderr.on('data', stdLog(console.error));
        subprocess.on('close', (code) => {
            Logger.error(`Bot subprocess exited with code ${code}`);

            botProcess = ChildProcess.spawn(process.argv[0], [process.argv[1], 'bot', '--reboot']);
            bindProcess(botProcess);
        });
    };

    bindProcess(botProcess);
    Logger.info('Bot subprocess spawned');
};

const botProcess = () => {
    const Discord = require('discord.js');
    const Config = require('./config.json');
    const Guild = require('./model/guild');
    const Language = require('./model/language');
    const Country = require('./model/country');
    const Command = require('./model/command');
    const SemiBlacklist = require('./model/semi-blacklist');
    const ModerationLog = require('./model/moderation-log');
    const DM = require('./model/dm');

    const crashRecover = (exception) => {
        Logger.exception(exception);
        Logger.notice('Need reboot');
    };

    process.on('uncaughtException', crashRecover);

    let bot = new Discord.Client();
    global.bot = bot;

    bot.on('error', crashRecover);

    /**
     * @param {GuildMember} member
     */
    bot.on('guildMemberAdd', (member) => {
        let englishMessage = `**Welcome to the official /r/French Discord, ${member.user}!\nTo be able to send messages in the other channels, please follow these instructions.**`;
        let frenchMessage = `**Bienvenue sur le serveur Discord officiel de /r/French, ${member.user} !\nPour pouvoir écrire dans les autres salons, veuillez suivre ces instructions.**`;

        englishMessage += '\n\nFor starters, you need to specify your proficiency in French by typing the command `!french` in the chat followed by your level. The available levels are `beginner`, `intermediate`, `advanced` and `native`. For example: `!french intermediate`';
        frenchMessage += '\n\nPour commencer, il faut que tu précises ton niveau en français en tapant dans le chat la commande `!french` suivie de ton niveau. Les niveaux sont `débutant`, `intermédiaire`, `avancé` et `natif`. Par exemple: `!french intermédiaire`';

        Guild.welcomeChannel.send(englishMessage + '\n\n' + frenchMessage);
    });

    /**
     * @param {GuildMember} member
     */
    bot.on('guildMemberRemove', async (member) => {
        Guild.clearWelcomeMessagesForMember(member);
        ModerationLog.processMemberRemove(member);
    });

    /**
     * @param {Message} message
     */
    bot.on('message', (message) => {
        SemiBlacklist.parseMessage(message);

        if (message.channel.id === Config.channels.welcome) {
            Guild.addMessageFromWelcomeToMap(message);
        }

        if (!message.author.bot) {
            const isCommand = Command.parseMessage(message);
            DM.parseMessage(message, isCommand);
        }
    });

    bot.on('ready', async () => {
        Logger.info('Logged in as ' + bot.user.username + '#' + bot.user.discriminator);

        Logger.info('--------');

        Logger.info('Syncing guilds...');
        bot.syncGuilds();
        await Guild.init(bot);
        Logger.info('Guilds synced. Serving in ' + Guild.discordGuild.name);

        Logger.info('--------');

        Logger.info('Initialising languages...');
        try {
            await Language.init();
        } catch (error) {
            Logger.exception(error);
        }
        Logger.info(`${Language.list.length} languages initialised.`);

        Logger.info('--------');

        Logger.info('Initialising countries...');
        try {
            await Country.init();
        } catch (error) {
            Logger.exception(error);
        }
        Logger.info(`${Country.list.length} countries initialised.`);

        Logger.info('--------');

        if (process.argv[3] === '--reboot') {
            Guild.botChannel.send('I\'m back :) .');
        }
    });

    Logger.info('--------');

    Logger.info('Logging in...');
    bot.login(Config.token);
};

process.argv[2] === 'bot' ? botProcess() : mainProcess();
