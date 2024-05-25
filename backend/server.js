const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const authRoute = require('./routes/auth');
const clientsRoute = require('./routes/clients');
const restaurateursRoute = require('./routes/restaurateurs');
const restaurantsRoute = require('./routes/restaurants');
const { initDb } = require('./initDb/db');
require('dotenv').config();

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'projet_partie2',
    password: ' ',
    port: 5432,
    client_encoding: 'UTF8'
});
// initDb(pool);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to the database');
    }
});
app.use(express.json());
app.use(cors());
// Middleware
app.use(bodyParser.json());
// Routes
app.use('/', authRoute(pool));
app.use('/clients', clientsRoute(pool));
app.use('/restaurants', restaurantsRoute(pool));
app.use('/restaurateurs', restaurateursRoute(pool));