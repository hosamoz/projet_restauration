const express = require('express');
const router = express.Router();
const { hashPwd, generateUniqueId, getAttributeOrEmpty, isEmpty } = require('../utils');


module.exports = (pool) => {
    // Register 
    router.post('/register', async (req, res) => {
        const data = req.body;
        console.log(data)
        let nom = getAttributeOrEmpty(data, "nom");
        let prenom = getAttributeOrEmpty(data, "prenom");
        let motDePasse = getAttributeOrEmpty(data, "motDePasse");
        let rue = getAttributeOrEmpty(data, "rue");
        let numero = getAttributeOrEmpty(data, "numero");
        let ville = getAttributeOrEmpty(data, "ville");
        let codePostal = getAttributeOrEmpty(data, "codePostal");
        let pays = getAttributeOrEmpty(data, "pays");
        let isRestaurateur = data["isRestaurateur"];
        let nomRestaurant = getAttributeOrEmpty(data, "nomRestaurant");

        //verify PKs
        if (isEmpty(motDePasse) || isEmpty(nom) || isEmpty(prenom) || isEmpty(nomRestaurant) || !isRestaurateur)
            return res.status(422).json({ "message": "Invalid data" });

        try {
            let hashedPwd = hashPwd(motDePasse);

            let queryClient = {
                text: ` INSERT INTO projet.Client (IdClient, MotDePasse, Nom, Prenom, Rue, Numero, Ville, CodePostal, Pays,Type)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
                        RETURNING IdClient;
                      `,
                values: [generateUniqueId(), hashedPwd, nom, prenom, rue, numero, ville, codePostal, pays, "Restaurateur"]
            }
            const result = await pool.query(queryClient);

            let queryRestaurant = {
                text: `  UPDATE projet.Restaurant
                         SET IdRestaurateur = $1
                         WHERE Nom = $2
                         RETURNING IdRestaurant;
                      `,
                values: [result.rows[0].idclient, nomRestaurant.toLowerCase()]
            }
            await pool.query(queryRestaurant);

            res.status(200).json(queryClient.rows[0].idclient);
        } catch (err) {
            console.error(err);
            await pool.query('ROLLBACK');
            res.status(500).json(err.detail);
        }
    });

    return router;
}

