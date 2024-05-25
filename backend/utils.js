const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const SECRET_KEY = "projetsupersecret"

async function getIdPlatByName(pool, name) {
    if (!name) return null;
    let query = {
        text: `SELECT IdPlat FROM projet.Plat WHERE Nom =$1`,
        values: [name]
    };
    let res = await pool.query(query);
    return res.rows.length > 0 ? res.rows[0].idplat : null;
}
async function getIdRestaurantByName(pool, name) {
    if (!name) return null;
    try {
        let queryRestaurant = {
            text: `SELECT IdRestaurant FROM projet.Restaurant WHERE Nom = $1`,
            values: [name.toLowerCase()]
        };
        let res = await pool.query(queryRestaurant);
        if (res.rows.length === 0) {
            console.error("Error: Restaurant not found:", name.toLowerCase());
            return null;
        }
        return res.rows[0].idrestaurant;
    } catch (error) {
        console.error('Error in getIdRestaurantByName:', error);
    }
}

async function getIdClientByName(pool, name, lastname) {
    if (!name || !lastname) return null;

    let query = {
        text: 'SELECT IdClient FROM projet.Client WHERE Prenom =$1 AND  Nom =$2',
        values: [name, lastname]
    };
    let res = await pool.query(query);
    return res.rows.length > 0 ? res.rows[0].idclient : null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
function readTSVFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            let lines = data.split('\n');
            let tableData = lines.map(line => line.split('\t'));
            resolve(tableData);
        });
    });
}
function parseDateTime(dateTimeString) {
    let date = new Date(dateTimeString);
    let formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    let formattedTime = date.toTimeString().split(' ')[0]; // HH:MM:SS

    return { formattedDate, formattedTime };
}
function generateUniqueId() {
    return uuidv4();
}
function hashPwd(password) {
    console.log("dans hashpwd", password)
    return crypto.createHmac('sha256', SECRET_KEY)
        .update(password)
        .digest('hex');;
}
function getAttributeOrEmpty(body, attributeName) {
    if (body == null) throw new Error('Body cannot be null');
    if (body[attributeName] == null || isEmpty(body[attributeName])) return "";
    return body[attributeName].trim();
}
function isEmpty(str) {
    if (str == null) return true;
    return str.trim().length == 0;
}

module.exports = {
    getIdPlatByName, getIdRestaurantByName, getIdClientByName,
    readTSVFile, parseDateTime, generateUniqueId, hashPwd, getAttributeOrEmpty, isEmpty
};