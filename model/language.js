const db = require('./db');
const Logger = require('@elian-wonhalf/pretty-logger');

const Language = {
    list: [],

    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, role FROM languages').on('result', row => {
                Language.list.push(row);
            }).on('error', (error) => {
                reject('Error loading languages: ' + error);
            }).on('end', resolve);
        });
    },
};

module.exports = Language;
