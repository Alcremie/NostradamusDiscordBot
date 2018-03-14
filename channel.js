const Config = require('./config');
const Channel = {botChannel: null, welcomeChannel: null};

Channel.retrieveChannels = (bot) => {
    Channel.botChannel = bot.guilds.get(Config.server.rfrench).channels.find('name', 'bot');
    Channel.welcomeChannel = bot.guilds.get(Config.server.rfrench).channels.find('name', 'bienvenue');
};

Channel.isBotChannel = (channel) => {
    return channel.id === Channel.botChannel.id;
};

Channel.logInChannel = (log) => {
    Channel.botChannel.send('**LOGGING** > ' + log);
    console.log(log);
};

module.exports = Channel;
