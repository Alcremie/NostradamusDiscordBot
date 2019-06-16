const Logger = require('@elian-wonhalf/pretty-logger');

const mainProcess = () => {
    const ChildProcess = require('child_process');

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

    let bot = new Discord.Client();

    /**
     * @param {Message} message
     */
    bot.on('message', (message) => {
        Command.parseMessage(message);
    });

    bot.on('ready', async () => {
        Logger.info('Logged in as ' + bot.user.username + '#' + bot.user.discriminator);

        Logger.info('--------');

        Logger.info('Syncing guilds...');
        bot.syncGuilds();
        Guild.init(bot);
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
