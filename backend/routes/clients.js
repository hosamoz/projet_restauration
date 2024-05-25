const express = require('express');
const router = express.Router();
const { hashPwd, generateUniqueId, getAttributeOrEmpty, isEmpty } = require('../utils')

module.exports = (pool) => {
    // Register 
    router.post('/register', async (req, res) => {
        const data = req.body;
        let nom = getAttributeOrEmpty(data, "nom");
        let prenom = getAttributeOrEmpty(data, "prenom");
        let motDePasse = getAttributeOrEmpty(data, "motDePasse");
        let rue = getAttributeOrEmpty(data, "rue");
        let numero = getAttributeOrEmpty(data, "numero");
        let ville = getAttributeOrEmpty(data, "ville");
        let codePostal = getAttributeOrEmpty(data, "codePostal");
        let pays = getAttributeOrEmpty(data, "pays");

        //verify PK
        if (isEmpty(motDePasse) || isEmpty(nom) || isEmpty(prenom))
            return res.status(422).json({ "message": "Invalid data" });

        try {
            let hashedPwd = hashPwd(motDePasse);

            let query = {
                text: ` INSERT INTO projet.Client (IdClient, MotDePasse, Nom, Prenom, Rue, Numero, Ville, CodePostal, Pays)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        RETURNING IdClient;
                      `,
                values: [generateUniqueId(), hashedPwd, nom, prenom, rue, numero, ville, codePostal, pays]
            }
            const result = await pool.query(query);
            res.status(200).json(result.rows[0].idclient);
        } catch (err) {
            console.error(err);
            await pool.query('ROLLBACK');
            res.status(500).json(err.detail);
        }
    });
    // GET all clients
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM projet.client');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            await pool.query('ROLLBACK');
            res.status(500).json(err.detail);
        }
    });
    // GET client by id
    router.get('/:id', async (req, res) => {
        try {
            let query = {
                text: `
                    SELECT *
                    FROM projet.client
                    WHERE idClient = $1 
                      `,
                values: [req.params.id]
            }
            const result = await pool.query(query);
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            await pool.query('ROLLBACK');
            res.status(500).json(err.detail);
        }
    });

    return router;
}