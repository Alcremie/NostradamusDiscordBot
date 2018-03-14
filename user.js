const Channel = require("./channel");
const Role = require("./role");
const server = require("./server");

const User = {};

User.hasLevelRole = (user) => {
    return User.hasRole(user, Role.frenchLevelRoles);
};

User.isFrenchNative = (user) => {
    return User.hasRole(user, Role.names.native);
};


User.hasStudentRole = (user) => {

};

User.hasNativeRole = (user) => {

};

User.hasModRole = (user) => {
    if(user === null) {
        Channel.logInChannel("Umm... null user does not have a mod role?");
	    return false;
    } else {
       return user.roles.exists('id', server.admin);
    }
};

User.hasLanguageRole = (user) => {
    return User.hasRole(user, Role.languages);
};

User.hasCountryRole = (user) => {
    return User.hasRole(user, Role.countries);
};

// checks if user has level, country, and native language roles
User.hasProperRoles = (user) => {
    let rolesSet = 0;

    if (User.hasLevelRole(user)) {
        rolesSet++;
    }

    if (User.hasLanguageRole(user) || User.hasRole(user, [Role.NO_LANGUAGE]) || User.isFrenchNative(user)) {
        rolesSet++;
    }

    if (User.hasCountryRole(user) || User.hasRole(user, [Role.NO_COUNTRY])) {
        rolesSet++;
    }

    return rolesSet >= 2;
};

User.hasRole = (user, roles) => {
    if (!user) return false;

    for (let i = 0, len = roles.length; i < len; i++) {
        if (user.roles.exists('name', roles[i])) {
            return true;
        }
    }

    return false;
};

User.getRole = (user, roles) => {
    if (!user) return false;

    for (let i = 0, len = roles.length; i < len; i++) {
        if (user.roles.exists('name', roles[i])) {
            return roles[i];
        }
    }

    return '';
};

module.exports = User;
