const express = require('express');
const router = express.Router();
const { getAttributeOrEmpty, isEmpty } = require('../utils');


module.exports = (pool) => {
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM projet.restaurant');
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err);
            await pool.query('ROLLBACK');
            res.status(500).json(err.detail);
        }
    });

    return router;
}

