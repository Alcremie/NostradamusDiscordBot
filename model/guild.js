const Config = require('../config.json');
const Language = require('./language');
const Country = require('./country');

const Guild = {
    /** {Object} */
    frenchLevelRolesIds: {
        native: Config.roles.native,
        advanced: Config.roles.advanced,
        intermediate: Config.roles.intermediate,
        beginner: Config.roles.beginner,
    },

    /** {Object} */
    frenchLevelRoles: {
        native: 'Francophone Natif',
        advanced: 'Avancé',
        intermediate: 'Intermédiaire',
        beginner: 'Débutant',
    },

    /** {Guild} */
    discordGuild: null,

    /** {TextChannel} */
    welcomeChannel: null,

    /**
     * @param {Client} bot
     */
    init: (bot) => {
        Guild.discordGuild = bot.guilds.find(guild => guild.id === Config.guild);
        Guild.welcomeChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.welcome);
        Guild.botChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.bot);
    },

    /**
     * @param message
     * @returns {GuildMember|null}
     */
    getMemberFromMessage: (message) => {
        let member;

        if (message.guild === null) {
            member = Guild.discordGuild.member(message.author);
        } else {
            member = message.member;
        }

        return member;
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasFrenchLevelRole: (member) => {
        return member.roles.some(role => Object.values(Guild.frenchLevelRolesIds).indexOf(role.id) > -1);
    },

    /**
     * @param {GuildMember} member
     * @returns {*}
     */
    isMemberFrenchNative: (member) => {
        return member.roles.has(Config.roles.native);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasLanguageRole: (member) => {
        return member.roles.some(role => {
            return Language.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noLanguage;
        });
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasCountryRole: (member) => {
        return member.roles.some(role => {
            return Country.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noCountry;
        });
    },

    /**
     * @param {GuildMember} member
     */
    isMemberMod: (member) => {
        return member.roles.has(Config.roles.mod);
    },

    /**
     * @param {string} roleName
     * @returns {Role|null}
     */
    getRoleByName: (roleName) => {
        return Guild.discordGuild.roles.find(role => role.name === roleName);
    }
};

module.exports = Guild;