const express = require('express');
const { hashPwd } = require('../db');
const router = express.Router();

module.exports = (pool) => {
    // LOGIN
    router.post('/login', async (req, res) => {
        const data = req.body;
        try {
            const result = await pool.query('SELECT name, pwd FROM projet.clients WHERE name = $1', [data.name]);
            if (result.rows.length > 0) {
                const storedPwd = result.rows[0].pwd;
                if (storedPwd === hashPwd(data.pwd)) {
                    res.status(200).json({ message: "Authentication Successful" });
                } else {
                    res.status(401).send("Authentication Unsuccessful. User or password incorrect.");
                }
            } else {
                res.status(401).send("Authentication Unsuccessful. User not found.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

    return router;
}
