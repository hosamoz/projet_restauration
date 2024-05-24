const fs = require('fs');
const path = require('path');
const { hashPwd, generateUniqueId, getIdRestaurantByName } = require('../utils')

async function initRestaurateurJson(pool) {
    let filePath = path.join(__dirname, 'data', 'restaurateur.json');

    try {
        let data = await fs.promises.readFile(filePath, 'utf8');
        let restaurateurs = JSON.parse(data);
        let pwd = hashPwd(process.env.PWD_USER);

        for (const restaurateur of restaurateurs) {
            const { firstname, lastname, address, restaurant } = restaurateur;
            const { street, number, zipcode, city, country } = address;
            let idClient = generateUniqueId();
            let idRestaurant = await getIdRestaurantByName(pool, restaurant);

            let getClientQuery = {
                text: `
                SELECT IdClient
                FROM projet.Client
                WHERE Nom =$1 AND  Prenom =$2 AND Rue=$3 AND Numero=$4 AND Ville=$5 AND CodePostal=$6 AND Pays=$7
                `,
                values: [lastname, firstname, street, number, city, zipcode, country],
            };

            let createClientQuery = {
                text: `
                    INSERT INTO projet.Client(IdClient,MotDePasse,Nom, Prenom, Rue, Numero, CodePostal, Ville, Pays, Type ) 
                    VALUES($1, $2, $3, $4, $5, $6, $7,$8,$9,$10) 
                    --ON CONFLICT (Nom, Prenom, Rue, Numero, Ville, CodePostal, Pays)
                    --DO NOTHING
                    RETURNING IdClient;`,
                values: [idClient, pwd, lastname, firstname, street, number, zipcode, city, country, "Restaurateur"],
            };

            try {
                let idRestaurateur;
                let resultGetClientQuery = await pool.query(getClientQuery);
                if (resultGetClientQuery.rows[0]?.idclient != null) {
                    idRestaurateur = resultGetClientQuery.rows[0].idclient;
                } else {
                    let resultCreateClient = await pool.query(createClientQuery);
                    idRestaurateur = resultCreateClient.rows[0].idclient;
                }
                let updateRestaurantQuery = {
                    text: `
                        UPDATE projet.Restaurant
                        SET IdRestaurateur = $1
                        WHERE IdRestaurant = $2;`,
                    values: [idRestaurateur, idRestaurant],
                };
                await pool.query(updateRestaurantQuery);
            } catch (error) {
                await pool.query('ROLLBACK');
                console.error('Error inserting data:', error);
                throw error;
            }
        };
    } catch (err) {
        console.error('Error reading file:', err);
    }
}
module.exports = {
    initRestaurateurJson
};