const bot = global.bot;
const Config = require('./config');
const Channel = require('./channel');
const auditLogFetchInterval = 5 * 60 * 1000; // 5 minutes
let memberLeftDate = null;
let searchAuditLogTimeout = null;
let membersWhoLeft = {};
let lastFetchedAuditLogId = null;

const doLog = async () => {
    const server = bot.guilds.get(Config.server.rfrench);
    const memberIds = Object.keys(membersWhoLeft);

    searchAuditLogTimeout = null;

    if (memberIds.length > 0) {
        const auditLogs = await server.fetchAuditLogs({
            after: lastFetchedAuditLogId,
        });

        lastFetchedAuditLogId = auditLogs.entries.first().id;

        auditLogs.entries.filter(entry => {
            const userTarget = entry.targetType === 'USER';
            const kickOrBan = entry.action === 'MEMBER_KICK' || entry.action === 'MEMBER_BAN_ADD';
            const inList = entry.target !== undefined && memberIds.indexOf(entry.target.id) > -1;

            return userTarget && kickOrBan && inList;
        }).map(entry => {
            if (membersWhoLeft[entry.target.id] === null) {
                let log = `Membre <@${entry.target.id}> ${entry.target.username}#${entry.target.discriminator}`;

                switch (entry.action) {
                    case 'MEMBER_KICK':
                        log = `${log} expulsé`;
                        break;

                    case 'MEMBER_BAN_ADD':
                        log = `${log} banni`;
                        break;
                }

                if (entry.reason !== null) {
                    log = `${log} pour la raison suivante : ${entry.reason}`;
                } else {
                    Channel.modLogChannel.send(`Hey @everyone, I just posted an entry in the public mod log that doesn't have a reason. Remember to **ALWAYS** input a reason when you kick or ban someone! Can someone go to the public log channel and provide the reason, like "Oh à propos de @machin, il a été ban parce que [RAISON]." please? Thank you ♥ !\nhttps://i.discord.fr/lQRn.gif`);
                }

                membersWhoLeft[entry.target.id] = log;
            }
        });

        for (const memberId in membersWhoLeft) {
            if (membersWhoLeft.hasOwnProperty(memberId) && membersWhoLeft[memberId] !== null) {
                Channel.publicModLog.send(membersWhoLeft[memberId]);
            }
        }
    }

    membersWhoLeft = {};
};

bot.on('guildMemberRemove', member => {
    const nowDate = new Date();
    const canLogNow = memberLeftDate === null || nowDate.getTime() - memberLeftDate.getTime() >= auditLogFetchInterval;

    membersWhoLeft[member.id] = null;

    if (!canLogNow && searchAuditLogTimeout === null) {
        searchAuditLogTimeout = setTimeout(
            () => {
                doLog();
            },
            auditLogFetchInterval - (nowDate.getTime() - memberLeftDate.getTime())
        );
    } else if (canLogNow) {
        doLog();
    }

    memberLeftDate = nowDate;
});