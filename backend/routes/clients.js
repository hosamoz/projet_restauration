const express = require('express');
const router = express.Router();
const { hashPwd } = require('../db')
require('dotenv').config();

module.exports = (pool) => {
    // CREATE A CLIENT
    router.post('/', async (req, res) => {
        const data = req.body;
        try {
            let hashedPwd = hashPwd(data.pwd)
            const result = await pool.query('INSERT INTO projet.clients (name,pwd) VALUES ($1,$2) RETURNING *', [data.name, hashedPwd]);
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
    // GET all clients
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM projet.clients');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });


    return router;
}
