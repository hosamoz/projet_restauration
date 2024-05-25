const express = require('express');
const { hashPwd } = require('../utils')
const router = express.Router();

module.exports = (pool) => {
    // LOGIN
    router.post('/login', async (req, res) => {
        const data = req.body;
        console.log(data)
        try {

            let query = {
                text: ` SELECT * FROM projet.client 
                        WHERE IdClient = $1 
                      `,
                values: [data.idClient]
            }
            const result = await pool.query(query);
            if (result.rows.length > 0) {
                console.log(result.rows[0].motdepasse)
                const storedPwd = result.rows[0].motdepasse;
                if (storedPwd == hashPwd(data.motDePasse)) {
                    console.log(hashPwd(data.motDePasse))
                    res.status(200).json("Authentication Successful");
                } else {
                    res.status(401).json("Authentication Unsuccessful. Client or password incorrect.");
                }
            } else {
                res.status(401).json("Authentication Unsuccessful. Client not found.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).json('Server Error');
        }
    });

    return router;
}
