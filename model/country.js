const db = require('./db');
const Logger = require('@elian-wonhalf/pretty-logger');

const Country = {
    list: [],

    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, role FROM countries').on('result', row => {
                Country.list.push(row);
            }).on('error', (error) => {
                reject('Error loading countries: ' + error);
            }).on('end', resolve);
        });
    },
};

module.exports = Country;
