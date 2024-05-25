
const fs = require('fs');
const path = require('path');
const { hashPwd, generateUniqueId } = require('../utils')

async function initCustomersJson(pool) {
    try {
        let filePath = path.join(__dirname, 'data', 'customers.json');
        let data = fs.readFileSync(filePath, 'utf8');
        let customers = JSON.parse(data);
        let pwd = hashPwd(process.env.PWD_USER);

        let insertions = customers.map(async (customer) => {
            let { firstname, lastname, address } = customer;
            let { street, number, zipcode, city, country } = address;
            if (!firstname.trim() || !lastname.trim())
                return;

            let query = {
                text: `
                    INSERT INTO projet.Client (IdClient,MotDePasse,Nom, Prenom, Rue, Numero, Ville,CodePostal , Pays)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING IdClient;`,
                values: [generateUniqueId(), pwd, lastname, firstname, street, number, zipcode, city, country],
            };

            try {
                let result = await pool.query(query);
                return result.rows[0]; // Returns the inserted IdClient
            } catch (error) {
                console.error('Error inserting data:', error);
                await pool.query('ROLLBACK');
                throw error;
            }
        });
        // Wait for all insertions to fnish
        await Promise.all(insertions);
    } catch (err) {
        console.error('Error initializing customers:', err);
        throw err;
    }
};
module.exports = {
    initCustomersJson
};