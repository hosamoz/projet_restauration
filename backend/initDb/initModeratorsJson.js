const fs = require('fs');
const path = require('path');
const { hashPwd, generateUniqueId } = require('../utils');

async function initModeratorsJson(pool) {
    try {
        let filePath = path.join(__dirname, 'data', 'moderators.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const moderators = JSON.parse(data);
        const pwd = hashPwd(process.env.PWD_USER);

        for (const moderator of moderators) {
            const { firstname, lastname, address } = moderator;
            const { street, number, zipcode, city, country } = address;
            if (!firstname.trim() || !lastname.trim())
                return;
            const idClient = generateUniqueId();
            const idModerateur = generateUniqueId();

            const query = {
                text: `
                    INSERT INTO projet.Client (IdClient, MotDePasse, Nom, Prenom, Rue, Numero, Ville, CodePostal, Pays, Type, IdModerateur)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT ON CONSTRAINT unique_client
                    DO UPDATE 
                    SET IdModerateur = $11, Type = 'Moderateur'
                    RETURNING IdClient;
                `,
                values: [idClient, pwd, lastname, firstname, street, number, city, zipcode, country, 'Moderateur', idModerateur],
            };
            try {
                await pool.query(query);
            } catch (error) {
                console.error('Error processing moderator:', error);
                await pool.query('ROLLBACK');
                throw error;
            }
        }
    } catch (err) {
        console.error('Error initializing moderators:', err);
        throw err;
    }
}
module.exports = {
    initModeratorsJson
};