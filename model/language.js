const db = require('./db');

const Language = {
    /** {Array} */
    list: [],

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, role FROM languages').on('result', row => {
                Language.list.push(row);
            }).on('error', (error) => {
                reject('Error loading languages: ' + error);
            }).on('end', resolve);
        });
    },

    /**
     * @param {string} english
     * @param {string} french
     * @returns {Promise}
     */
    add: (english, french) => {
        return new Promise((resolve, reject) => {
            Language.list.push({friendly: english, role: french});

            db.query('SET NAMES utf8');
            db.query(`INSERT INTO languages (friendly, role) VALUES (?, ?)`, [english, french], (error) => {
                error ? reject(error) : resolve();
            });
        });
    },

    /**
     * @returns {Array}
     */
    getRoleNameList: () => {
        return Language.list.map(row => row.role);
    },

    /**
     * @returns {Array}
     */
    getFriendlyNameList: () => {
        return Language.list.map(row => row.friendly);
    },

    /**
     * @returns {Array}
     */
    getNameList: () => {
        return Language.getRoleNameList().concat(Language.getFriendlyNameList());
    },

    /**
     * @param {string} string
     * @returns {string|null}
     */
    getRoleNameFromString: (string) => {
        let roleName = null;

        if (Language.getFriendlyNameList().map(name => name.toLowerCase()).indexOf(string.toLowerCase()) > -1) {
            roleName = Language.list.find(element => element.friendly.toLowerCase() === string.toLowerCase()).role;
        } else if (Language.getRoleNameList().map(name => name.toLowerCase()).indexOf(string.toLowerCase()) > -1) {
            roleName = string;
        }

        return roleName;
    }
};

module.exports = Language;
