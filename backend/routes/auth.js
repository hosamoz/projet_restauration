const express = require('express');
const { hashPwd } = require('../utils')
const router = express.Router();

module.exports = (pool) => {
    // LOGIN
    router.post('/login', async (req, res) => {
        const data = req.body;
        try {

            let query = {
                text: ` SELECT * FROM projet.client 
                        WHERE IdClient = $1 
                      `,
                values: [data.idClient]
            }
            const result = await pool.query(query);
            if (result.rows.length > 0) {
                const storedPwd = result.rows[0].motdepasse;
                if (storedPwd == hashPwd(data.motDePasse)) {
                    res.status(200).json({ message: "Authentication Successful", user: result.rows[0] });
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
