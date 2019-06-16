const db = require('./db');

const Country = {
    /** {Array} */
    list: [],

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, role FROM countries').on('result', row => {
                Country.list.push(row);
            }).on('error', (error) => {
                reject('Error loading countries: ' + error);
            }).on('end', resolve);
        });
    },

    /**
     * @returns {Array}
     */
    getRoleNameList: () => {
        return Country.list.map(row => row.role);
    },

    /**
     * @returns {Array}
     */
    getFriendlyNameList: () => {
        return Country.list.map(row => row.friendly);
    },

    /**
     * @returns {Array}
     */
    getNameList: () => {
        return Country.getRoleNameList().concat(Country.getFriendlyNameList());
    },

    /**
     * @param {string} string
     * @returns {string|null}
     */
    getRoleNameFromString: (string) => {
        let roleName = null;

        if (Country.getFriendlyNameList().map(name => name.toLowerCase()).indexOf(string.toLowerCase()) > -1) {
            roleName = Country.list.find(element => element.friendly.toLowerCase() === string.toLowerCase()).role;
        } else if (Country.getRoleNameList().map(name => name.toLowerCase()).indexOf(string.toLowerCase()) > -1) {
            roleName = string;
        }

        return roleName;
    }
};

module.exports = Country;
