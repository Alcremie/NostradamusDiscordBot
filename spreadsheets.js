const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const SHEET_ID = '1fVzyvrhaHco8ErD2ox11oKyQUcGsou2HcYTNFeo_Fks';
const SHEET_TAB = 'Feuille 1';

const INSERT_DATA_OPTION_INSERT_ROWS = 'INSERT_ROWS';
const INSERT_DATA_OPTION_OVERWRITE = 'OVERWRITE';
const VALUE_INPUT_OPTION_RAW = 'RAW';
const VALUE_INPUT_OPTION_USER_ENTERED = 'USER_ENTERED';
const MAJOR_DIMENSION_ROWS = 'ROWS';
const MAJOR_DIMENSION_COLUMNS = 'COLUMNS';

const Spreadsheets = {
    ready: false,
    sheets: null,
    lastTimestamp: null,
    lastWrittenTimestamp: null,
    nbMessages: [],

    get: function (sheetName, range) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: `'${sheetName}'!${range}`,
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.data.values);
                }
            });
        });
    },
    set: function (sheetName, range, data) {
        return new Promise((resolve, reject) => {
            let sheetRange = `'${sheetName}'`;

            if (range !== null && range.length > 0) {
                sheetRange = `${sheetRange}!${range}`;
            }

            this.sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: sheetRange,
                includeValuesInResponse: false,
                valueInputOption: VALUE_INPUT_OPTION_USER_ENTERED,
                resource: {
                    majorDimension: MAJOR_DIMENSION_ROWS,
                    values: data
                }
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.data.values);
                }
            });
        });
    },
    fillRowBetween: function (row, fromColumn, toColumn) {
        let colsCount = toColumn - fromColumn + 1;
        let data = [];
        let fromColumnName = getColumnNameFromDecimalValue(fromColumn);
        let toColumnName = getColumnNameFromDecimalValue(toColumn);

        data.length = colsCount;
        data.fill('0');

        this.set(SHEET_TAB, `${fromColumnName}${row}:${toColumnName}${row}`, [data]);
    },
    writeMessageAmount: async function (amount, timestamp) {
        const rows = await this.get(SHEET_TAB, 'A:A');
        const currentDate = new Date(timestamp);
        let lastRow = 2;
        let writeDate = false;
        let lastDate = null;

        if (typeof rows !== 'undefined') {
            lastRow = rows.length;

            if (this.lastWrittenTimestamp !== null) {
                lastDate = new Date(this.lastWrittenTimestamp);
            } else {
                const [day, month, year] = (await this.get('Feuille 1', `A${lastRow}:A${lastRow}`))[0][0].split('/');
                lastDate = new Date(`${year}/${month}/${day}`);
            }

            writeDate = sameDay(lastDate, currentDate);
        } else {
            writeDate = true;
        }

        let targetRow = lastRow;
        const targetColumnNumber = getColumnNumberFromDate(currentDate);
        const targetColumnName = getColumnNameFromDecimalValue(targetColumnNumber);

        if (this.lastWrittenTimestamp !== null) {
            const lastColumnNumber = getColumnNumberFromDate(lastDate);

            if (!sameDay(lastDate, currentDate)) {
                targetRow++;

                (lastColumnNumber < 144) && this.fillRowBetween(lastRow, lastColumnNumber + 1, 144);

                this.set(
                    SHEET_TAB,
                    `A${targetRow}:A${targetRow}`,
                    [[this.getDateString(currentDate)]]
                );
            }

            (targetColumnNumber - lastColumnNumber > 1) && this.fillRowBetween(
                targetRow,
                lastColumnNumber + 1,
                targetColumnNumber - 1
            );
        }

        writeDate && this.set(
            SHEET_TAB,
            `A${targetRow}:A${targetRow}`,
            [[this.getDateString(currentDate)]]
        );

        this.set(
            SHEET_TAB,
            `${targetColumnName}${targetRow}:${targetColumnName}${targetRow}`,
            [[amount.toString()]]
        );

        this.lastWrittenTimestamp = timestamp;
    },
    getDateString: function(date) {
        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString();

        if (day.length < 2) {
            day = `0${day}`;
        }

        if (month.length < 2) {
            month = `0${month}`;
        }

        return `${day}/${month}/${date.getFullYear()}`;
    },
    floorDateByTenMinutes: function(date) {
        date.setMinutes(Math.floor(date.getMinutes() / 10) * 10);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    },
    incrementNumberMessages: function() {
        const currentTimestamp = this.floorDateByTenMinutes(new Date()).getTime();

        if (this.lastTimestamp !== null && this.lastTimestamp !== currentTimestamp) {
            this.writeMessageAmount(this.nbMessages[this.lastTimestamp], this.lastTimestamp);
            delete this.nbMessages[this.lastTimestamp];
        }

        if (!this.nbMessages.hasOwnProperty(currentTimestamp)) {
            this.nbMessages[currentTimestamp] = 0;
        }

        this.lastTimestamp = currentTimestamp;
        this.nbMessages[currentTimestamp]++;
    }
};

fs.readFile('credentials.json', (err, content) => {
    if (err) {
        console.log('Error loading client secret file:', err);
    } else {
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), readyHandler);
    }
});

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            getNewToken(oAuth2Client, callback);
        } else {
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        }
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error while trying to retrieve access token', err);
            } else {
                oAuth2Client.setCredentials(token);
                console.log('Trying to save token...');

                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Token stored to', TOKEN_PATH);
                    }
                });

                callback(oAuth2Client);
            }
        });
    });
}

function readyHandler(auth) {
    const sheets = google.sheets({version: 'v4', auth});

    Spreadsheets.ready = true;
    Spreadsheets.sheets = sheets;
}

function sameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function getColumnNumberFromDate(timestamp) {
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();

    return Math.floor(hours * 6 + minutes / 10 + 1);
}

function getColumnNameFromDecimalValue(decimalValue) {
    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const firstLetter = decimalValue > 25 ? alphabet[Math.floor(decimalValue / 26) - 1] : '';
    const secondLetter = alphabet[decimalValue % 26];

    return firstLetter.toUpperCase() + secondLetter.toUpperCase();
}

module.exports = Spreadsheets;
