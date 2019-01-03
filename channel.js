const Discord = require("discord.js");
const Config = require('./config');
const Channel = {botChannel: null, welcomeChannel: null};

Channel.retrieveChannels = (bot) => {
    Channel.botChannel = bot.guilds.get(Config.server.rfrench).channels.find(channel => channel.name === 'bot');
    Channel.welcomeChannel = bot.guilds.get(Config.server.rfrench).channels.find(channel => channel.name === 'bienvenue');
};

Channel.isBotChannel = (channel) => {
    return channel.id === Channel.botChannel.id;
};

Channel.logInChannel = (log) => {
    Channel.botChannel.send('**LOGGING** > ' + log);
    console.log(log);
};

Channel.messageToEmbed = (message) => {
    const member = message.member;
    const suffix = member !== null && member.nickname !== null ? ` aka ${member.nickname}` : '';

    return new Discord.RichEmbed()
        .setAuthor(
            `${message.author.username}#${message.author.discriminator}${suffix}`,
            message.author.displayAvatarURL
        )
        .setColor(0x00FF00)
        .setDescription(message.content);
};

module.exports = Channel;
