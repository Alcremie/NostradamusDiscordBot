const Config = require('../config');

const Guild = {
    /** {Guild} */
    discordGuild: null,

    /** {TextChannel} */
    welcomeChannel: null,

    /**
     * @param {Client} bot
     */
    init: function (bot) {
        Guild.discordGuild = bot.guilds.find(guild => guild.id === Config.guild);
        Guild.welcomeChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.welcome);
        Guild.botChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.bot);
    },

    /**
     * @param {GuildMember} member
     */
    isMemberMod: function (member) {
        return member.roles.has(Config.modRoleId);
    }
};

module.exports = Guild;