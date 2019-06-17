const bot = global.bot;
const Guild = require('./guild');

const ModerationLog = {
    memberLeftDate: null,
    auditLogFetchInterval: 5 * 60 * 1000, // 5 minutes
    searchAuditLogTimeout: null,
    membersWhoLeft: {},
    lastFetchedAuditLogId: null,

    processMemberRemove: (member) => {
        const nowDate = new Date();
        const lastLogDateIsNull = ModerationLog.memberLeftDate === null;
        const elapsedTimeSinceLastLog = nowDate.getTime() - ModerationLog.memberLeftDate.getTime();
        const canLogNow = lastLogDateIsNull || elapsedTimeSinceLastLog >= ModerationLog.auditLogFetchInterval;

        ModerationLog.membersWhoLeft[member.id] = null;

        if (!canLogNow && ModerationLog.searchAuditLogTimeout === null) {
            ModerationLog.searchAuditLogTimeout = setTimeout(
                ModerationLog.doLog,
                ModerationLog.auditLogFetchInterval - elapsedTimeSinceLastLog
            );
        } else if (canLogNow) {
            ModerationLog.doLog();
        }

        ModerationLog.memberLeftDate = nowDate;
    },

    doLog: async () => {
        const memberIds = Object.keys(ModerationLog.membersWhoLeft);

        ModerationLog.searchAuditLogTimeout = null;

        if (memberIds.length > 0) {
            const auditLogs = await Guild.discordGuild.fetchAuditLogs({
                after: ModerationLog.lastFetchedAuditLogId,
            });

            ModerationLog.lastFetchedAuditLogId = auditLogs.entries.first().id;

            auditLogs.entries.filter(entry => {
                const userTarget = entry.targetType === 'USER';
                const kickOrBan = entry.action === 'MEMBER_KICK' || entry.action === 'MEMBER_BAN_ADD';
                const inList = entry.target !== undefined && memberIds.indexOf(entry.target.id) > -1;

                return userTarget && kickOrBan && inList;
            }).map(entry => {
                if (ModerationLog.membersWhoLeft[entry.target.id] === null) {
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
                        Guild.modLogChannel.send(`Hey @everyone, I just posted an entry in the public mod log that doesn't have a reason. Remember to **ALWAYS** input a reason when you kick or ban someone! Can someone go to the public log channel and provide the reason, like "Oh à propos de @machin, il a été ban parce que [RAISON]." please? Thank you ♥ !\nhttps://i.discord.fr/lQRn.gif`);
                    }

                    ModerationLog.membersWhoLeft[entry.target.id] = log;
                }
            });

            for (const memberId in ModerationLog.membersWhoLeft) {
                if (ModerationLog.membersWhoLeft.hasOwnProperty(memberId) && ModerationLog.membersWhoLeft[memberId] !== null) {
                    Guild.publicModLogChannel.send(ModerationLog.membersWhoLeft[memberId]);
                }
            }
        }

        ModerationLog.membersWhoLeft = {};
    }
};

module.exports = ModerationLog;