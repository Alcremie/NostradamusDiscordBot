const Guild = require('../guild');
const MemberRolesFlow = require('../member-roles-flow');

const levels = {
    // Native
    'natif': Guild.frenchLevelRolesIds.native,
    'native': Guild.frenchLevelRolesIds.native,
    'nativ': Guild.frenchLevelRolesIds.native,
    'natife': Guild.frenchLevelRolesIds.native,

    // Advanced
    'avancé': Guild.frenchLevelRolesIds.advanced,
    'avance': Guild.frenchLevelRolesIds.advanced,
    'advanced': Guild.frenchLevelRolesIds.advanced,
    'advance': Guild.frenchLevelRolesIds.advanced,
    'avanc': Guild.frenchLevelRolesIds.advanced,
    'adanced': Guild.frenchLevelRolesIds.advanced,
    'adance': Guild.frenchLevelRolesIds.advanced,
    'expert': Guild.frenchLevelRolesIds.advanced,
    'awesome': Guild.frenchLevelRolesIds.advanced,

    // Intermediate
    'intermédiaire': Guild.frenchLevelRolesIds.intermediate,
    'intermediaire': Guild.frenchLevelRolesIds.intermediate,
    'intermediair': Guild.frenchLevelRolesIds.intermediate,
    'intermediai': Guild.frenchLevelRolesIds.intermediate,
    'intermediate': Guild.frenchLevelRolesIds.intermediate,
    'intermediat': Guild.frenchLevelRolesIds.intermediate,

    // Beginner
    'débutant': Guild.frenchLevelRolesIds.beginner,
    'debutant': Guild.frenchLevelRolesIds.beginner,
    'débutante': Guild.frenchLevelRolesIds.beginner,
    'debutante': Guild.frenchLevelRolesIds.beginner,
    'beginner': Guild.frenchLevelRolesIds.beginner,
    'beginer': Guild.frenchLevelRolesIds.beginner,
    'beginne': Guild.frenchLevelRolesIds.beginner,
    'beginn': Guild.frenchLevelRolesIds.beginner,
    'begin': Guild.frenchLevelRolesIds.beginner,
};

levels[Guild.frenchLevelRoles.native.toLowerCase()] = Guild.frenchLevelRolesIds.native;
levels[Guild.frenchLevelRoles.advanced.toLowerCase()] = Guild.frenchLevelRolesIds.advanced;
levels[Guild.frenchLevelRoles.intermediate.toLowerCase()] = Guild.frenchLevelRolesIds.intermediate;
levels[Guild.frenchLevelRoles.beginner.toLowerCase()] = Guild.frenchLevelRolesIds.beginner;

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const member = Guild.getMemberFromMessage(message);
    const rolesToRemove = member.roles.array().filter(
        role => Object.values(Guild.frenchLevelRoles).indexOf(role.name) > -1
    );
    const level = args.join(' ').toLowerCase().trim();

    if (member === null) {
        message.reply('sorry, you do not seem to be on the server.');
        return;
    }

    if (levels.hasOwnProperty(level)) {
        const role = levels[level];

        if (rolesToRemove.length > 0) {
            await member.removeRoles(rolesToRemove);
        }

        member.addRole(role).then((member) => {
            MemberRolesFlow.answerWithNextStep(message, member);
        });
    } else {
        let reply = '\n';

        if (levels === '') {
            reply += '\nYou need to enter in a level. The command `!french` alone does not tell me which level you are. For example: `!french beginner`';
            reply += '\nIl faut que tu spécifies un niveau. La commande `!french` seule ne me permet pas de savoir quel est ton niveau en français. Par exemple : `!french débutant`';
        } else {
            reply += '\nThat level is not valid. Maybe you mispelled something? The levels are `beginner`, `intermediate`, `advanced` and `native`.';
            reply += '\nCe niveau n\'est pas valide. Peut-être que tu as fait une faute de frappe ? Les différents niveaux sont `débutant`, `intermédiaire`, `avancé` et `natif`.';
        }

        message.reply(reply);
    }
};
