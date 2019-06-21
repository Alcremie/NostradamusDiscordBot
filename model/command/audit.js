const Guild = require('../guild');
const Language = require('../language');
const Country = require('../country');
const nonLanguageNorCountryRoles = [
    'Do not assign this role',
    'Modo',
    'Bôt non puni',
    'Bôt',
    'Tuteur / Tutrice',
    '/r/French',
    'Muted',
    'Francophone Natif',
    'Avancé',
    'Intermédiaire',
    'Débutant',
    'Du jour',
    'Trombinoscope',
    'Comité de décision',
    'Membre Officiel',
    'SANS PAYS',
    'SANS LANGUE',
    'DJ',
    'Langue',
    'Dyno',
    'Lecture à voix haute',
    'Mini classe',
    'Dictée',
    'Rawgoat',
    'Rai',
    'Statbot',
    'Nitro Booster',
    '@everyone',
];

/**
 * @param {Message} message
 */
module.exports = (message) => {
    let member;

    if (message.guild === null) {
        member = Guild.discordGuild.member(message.author);

        if (member === null) {
            message.reply('sorry, you do not seem to be on the server.');
            return;
        }
    } else {
        member = message.member;
    }

    if (Guild.isMemberMod(member)) {
        let answer = '\n';

        const languagesList = Language.list.map(language => language.role);
        const countriesList = Country.list.map(country => country.role);
        const rolesList = Guild.discordGuild.roles.array().map(role => role.name);

        answer += `I found ${languagesList.length} languages and ${countriesList.length} countries in the DB.\n`;
        answer += `I found ${rolesList.length} roles on the server (knowing that there are not only languages and countries in there).\n\n`;

        const languagesWithoutRoles = languagesList.filter(language => rolesList.indexOf(language) < 0);
        const countriesWithoutRoles = countriesList.filter(country => rolesList.indexOf(country) < 0);

        answer += `I found ${languagesWithoutRoles.length} language${languagesWithoutRoles.length === 1 ? '' : 's'} that are in the DB but don't have any role assigned`;
        if (languagesWithoutRoles.length > 0) {
            answer += `:\n\n${languagesWithoutRoles.join(', ')}`;
        }

        answer += `\nI found ${countriesWithoutRoles.length} countr${countriesWithoutRoles.length === 1 ? 'y' : 'ies'} that are in the DB but don't have any role assigned`;
        if (countriesWithoutRoles.length > 0) {
            answer += `:\n\n${countriesWithoutRoles.join(', ')}`;
        }

        const mergedDBEntries = languagesList + countriesList + nonLanguageNorCountryRoles;
        const rolesWithoutDBEntry = rolesList.filter(role => mergedDBEntries.indexOf(role) < 0);

        answer += `\n\nI found ${rolesWithoutDBEntry.length} role${rolesWithoutDBEntry.length === 1 ? '' : 's'} that don't have any DB entry assigned`;
        if (rolesWithoutDBEntry.length > 0) {
            answer += `:\n\n${rolesWithoutDBEntry.join(', ')}`;
        }

        message.reply(answer);
    }
};
