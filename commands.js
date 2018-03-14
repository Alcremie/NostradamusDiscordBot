const Channel = require("./channel");
const Role = require("./role");
const User = require("./user");
const commands = {
    prefix: '!'
};
// key = user
// array of requests
let REQUESTS = {};
const REQUEST_LIMIT = 5;
const DELAY = 3000;

// !french [beginner|intermediate|advanced|native]
commands.setFrenchLevel = (input, guildMessage) => {
    const validRoles = Role.frenchLevelRoles;
    const member = guildMessage.member;
	let previousRole = '';

    // empty argument
    if (!input) {
        guildMessage.channel.send('You need to enter in a role.');
        return;
    }

	if (!member) {
		Channel.logInChannel('User doesn\'t exist');
		return;
	}

    let text = input.toLowerCase();

    // make sure user doesn't already have a student or native role...
    // alternatively, maybe we should remove the old role?
    if (User.hasLevelRole(member)) {
		previousRole = User.getRole(member, Role.frenchLevelRoles);
    }

    // find role in alt list
    let role = Role.names[text];
    let isStudent = text !== 'native';

    // role isn't in the list, or it's not a valid normal user role
    if (!role || !validRoles.includes(role)) {
        guildMessage.channel.send(member.user + ': That is not a valid level role. Did you misspell something?');
        return;
    }

	if (role === previousRole) {
		guildMessage.channel.send(member.user + ': You already have that role.');
        return;
	}

    // get the Role object
    let newRole = guildMessage.guild.roles.find('name', role);
    let roles = [newRole];

    if (isStudent && !previousRole.length) {
        roles.push(guildMessage.guild.roles.find('name', 'Étudiant'));
    }

    if (User.hasProperRoles(member) && !User.hasRole(member, ['Membre Officiel'])) {
        roles.push(getAccessRole(guildMessage));
    }

    member.addRoles(roles).then(() => {
		if (previousRole) {
			guildMessage.channel.send(member.user + ': Your level has been changed to `' + role + '`.');
		} else {
        	guildMessage.channel.send(member.user + ': You\'ve been tagged with `' + role + '`.');
		}

		if (User.hasRole(member, [previousRole])) {
			let roleToRemove = guildMessage.guild.roles.find('name', previousRole);

			setTimeout(() => {
				member.removeRole(roleToRemove).then((info) => {
				}, err => {
					Channel.logInChannel('Error trying to remove SANS PAYS role:' + err);
				});
			}, DELAY);
		}
    }, err => {
        Channel.logInChannel(err);
        guildMessage.channel.send('Something went wrong...');
    });
};

// !language [language]
commands.setNativeLanguage = (input, guildMessage) => {
    let validRoles = Role.languages;
    let member = guildMessage.member;
    let noRole = Role.NO_LANGUAGE;

    // empty argument
    if (!input) {
        guildMessage.channel.send(member.user + ': You need to enter in a role.');
        return;
    }

	if (!member) {
		Channel.logInChannel('user doesn\'t exist');
		return;
	}
    
	let text = input.toLowerCase();
    let role = Role.names[text];

    // check alt list
    if (!role) {
        role = Role.alts[text];
    }

    // role isn't in the list, or it's not a valid language role
    if (!role || !validRoles.includes(role)) {
        guildMessage.channel.send(member.user + ': I don\'t recognize that language. I\'ve put in a request to add it.');
        role = noRole;
        requestTag(input, guildMessage, 'language');
    }

    let isFrench = text === 'french' || text === 'francais' || text === 'français';

	if (isFrench) {
		role = Role.names.native;
	}

	if (User.hasRole(member, [role])) {
		if (role !== noRole) { 
	    	guildMessage.channel.send(member.user + ': You already have that role.');
        }
		return;
	}

    // get the Role object
    let newRole = guildMessage.guild.roles.find('name', role);
    let roles = [newRole];

    if (User.hasProperRoles(member) && !User.hasRole(member, ['Membre Officiel'])) {
        roles.push(getAccessRole(guildMessage));
    }

    member.addRoles(roles).then(() => {
        if (role !== noRole) {
            guildMessage.channel.send(member.user + ': You\'ve been tagged with `' + role + '`.');

            if (User.hasRole(member, [noRole])) {
                let roleToRemove = guildMessage.guild.roles.find('name', noRole);

                setTimeout(() => {
                    member.removeRole(roleToRemove).then((info) => {
                    }, err => {
                        Channel.logInChannel('Error trying to remove SANS PAYS role:' + err);
                    });
                }, DELAY);
            }
        }
    }, err => {
        Channel.logInChannel(err);
        guildMessage.channel.send('Something went wrong...');
    });
};

// !origin [country]
commands.setCountry = (input, guildMessage) => {
    let validRoles = Role.countries;
    let member = guildMessage.member;
    let noRole = Role.NO_COUNTRY;

    // empty argument
    if (!input) {
        guildMessage.channel.send(member.user + ': You need to enter in a role.');
        return;
    }

	if (!member) {
        Channel.logInChannel('user doesn\'t exist');
        return;
    }	

    let text = input.toLowerCase();

    // make sure user doesn't already have a country role...
    // alternatively, maybe we should remove the old role?
    if (User.hasCountryRole(member)) {
        guildMessage.channel.send(member.user + ': You\'ve already been tagged with a country.');
        return;
    }

    // find role in alt list
    let role = Role.names[text];
    // check alt list
    if (!role) {
        role = Role.alts[text];
    }

    // role isn't in the list, or it's not a valid country role
    if (!role || !validRoles.includes(role)) {
        guildMessage.channel.send(member.user + ': I don\'t recognize that country. I\'ve put in a request to add it.');
        requestTag(input, guildMessage, 'country');
        role = noRole;
    }

	if (User.hasRole(member, [role])) {
        if (role !== noRole) {
            guildMessage.channel.send(member.user + ': You already have that role.');
        }

        return;
    }

    // get the Role object
    let newRole = guildMessage.guild.roles.find('name', role);
    let roles = [newRole];
    
	if (User.hasProperRoles(member) && !User.hasRole(member, ['Membre Officiel'])) {
        roles.push(getAccessRole(guildMessage));
    }
    
	member.addRoles(roles).then(() => {
		if (role !== noRole) {
            guildMessage.channel.send(member.user + ': You\'ve been tagged with `' + role + '`.');

            if (User.hasRole(member, [noRole])) {
                let roleToRemove = guildMessage.guild.roles.find('name', noRole);

                setTimeout(() => {
                    member.removeRole(roleToRemove).then((info) => {
                    }, err => {
                        Channel.logInChannel('Error trying to remove SANS PAYS role:' + err);
                    });
                }, DELAY);
            }
        }
    }, err => {
		Channel.logInChannel(err);
        guildMessage.channel.send('Something went wrong...');
    });
};




commands.getList = (input, guildMessage) => {
    if (input.startsWith('countr')) {
        guildMessage.channel.send('```' + prettyPrint(Role.countriesFriendly) + '```');
    } else if (input.startsWith('lang')) {
        guildMessage.channel.send('```' + prettyPrint(Role.languagesFriendly) + '```');
    }
};

commands.loadRoles = (guildMessage) => {
    if (!User.hasModRole(guildMessage.member)) return;

    for (let i = 0; i < Role.languages.length; i++) {
        if (!guildMessage.guild.roles.find('name', Role.languages[i])) {
          Role.createRole(guildMessage.guild, Role.languages[i])
              .then(role => Channel.logInChannel(`Created role ${role}`))
              .catch(console.error)
        }
    }

    for (let i = 0; i < Role.countries.length; i++) {
        if (!guildMessage.guild.roles.find('name', Role.countries[i])) {
            Role.createRole(guildMessage.guild, Role.countries[i])
                .then(role => Channel.logInChannel(`Created role ${role}`))
                .catch(console.error)
        }
    }
};

commands.addSuggestion = (input, DMMessage) => {
	let user = DMMessage.author;
	
	user.send('Thank you for your suggestion. Your suggestion will be considered by the mod team.')
 		.then(message => Channel.logInChannel(`Sent message: ${message.content}`))
 		.catch(console.error);

    Channel.botChannel.send('Suggestion by <@' + user.id + '>: `' + input + '`');
};

commands.warnSuggestion = (input, guildMessage) => {
	let user = guildMessage.member.user;

	guildMessage.channel.send(user + ': Please check your private messages for more information on making suggestions.');

	user.send('To make a suggestion, please reply to this message using the following command:```!suggest yoursuggestionhere```')
 		.then(message => Channel.logInChannel(`Sent message: ${message.content}`))
 		.catch(console.error);
};

commands.dmSent = (input, DMMessage) => {
	let user = DMMessage.author;

    Channel.botChannel.send('New message to Nostradamus by ' + user + ': `' + input + '`');
};

commands.addNewRole = (english, french, type, guildMessage) => {
	if (!english || !french || !type || !guildMessage) {
		return;
	}

	if (Channel.isBotChannel(guildMessage.channel)) {
		if (!guildMessage.guild.roles.find('name', french)) {
            Role.createRole(guildMessage.guild, french)
                .then(role => {
                    guildMessage.channel.send('Added new role: ' + french);
                    Channel.logInChannel(`Created role ${role}`)
                })
                .catch(console.error);

			// then add to database
			Role.add(english, french, type);
		} else {
            guildMessage.channel.send('The role ' + french + ' already exists.');
        }
	}
};

commands.tagUser = (input, guildMessage) => {
    let userId = guildMessage.mentions.users.first();

    guildMessage.guild.fetchMember(userId).then((user) => {
        if (!user) return;

        let text = input.toLowerCase();
        let role = Role.names[text];

        if (!role) return;

        let newRole = guildMessage.guild.roles.find('name', role);
        let noRole = Role.isCountryRole(role) ? Role.NO_COUNTRY : Role.NO_LANGUAGE;

        setTimeout(function() {
            user.addRole(newRole).then(() => {
                guildMessage.channel.send(userId + ': You\'ve been tagged with `' + role + '`.');

                if (User.hasRole(user, [noRole])) {
                    let roleToRemove = guildMessage.guild.roles.find('name', noRole);

                    setTimeout(() => {
                        user.removeRole(roleToRemove).then(null, err => {
                            Channel.logInChannel('Error trying to remove SANS PAYS role:' + err);
                        });
                    }, DELAY);
                }
            }, err => {
                Channel.logInChannel(err);
                guildMessage.channel.send('Something went wrong...');
            });
        }, DELAY);
    }, err => {
        Channel.logInChannel('User didn\'t have "New" role to begin with?:' + err);
    });
};

commands.setAvatar = (input, guildMessage, bot) => {
    bot.user.setAvatar(input).then(() => {
        guildMessage.reply('my avatar has been changed!')
    }).catch((err) => {
        guildMessage.reply('there has been an error changing my avatar. Check the logs for more details.');
        Channel.logInChannel(err);
    });
};

const requestTag = (input, guildMessage, type) => {
    let text = input.toLowerCase();
    let user = guildMessage.member.user;
    let hasDuplicate = false;

    if (!REQUESTS.id) {
        REQUESTS.id = [];
    }

    if (REQUESTS.id.includes(text)) {
        hasDuplicate = true;
    }

    REQUESTS.id.push(text);

    // don't let the user request more than 3 times
    if (REQUESTS.id.length <= REQUEST_LIMIT && !hasDuplicate) {
        Channel.botChannel.send(type + ' tag request by ' + user + ': `' + text + '`');
    }
};

// get access role
const getAccessRole = (data) => {
    return data.guild.roles.find('name', 'Membre Officiel');
};


const prettyPrint = (arr) => {
    if (!arr) return;

    const longestLength = arr.reduce(function (a, b) { return a.length > b.length ? a : b; }).length;

    const prettyArr = arr.map(function(str) {
        const spacesToAdd = longestLength - str.length;

        return str.replace(' ', '\xa0') + ' '.repeat(spacesToAdd);
    });

    return prettyArr.join(' ');
};

// clear the requests array every hour
setInterval(function() {
    REQUESTS = {};
    console.log('Tag request queue cleared.');
}, 3600000);

module.exports = commands;
