const crypto = require('crypto');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const xml2js = require('xml2js');

const pwdUsers = "Test"; //password par default pour les clients

function initDb(pool) {
    try {
        initCustomersJson(pool);
        initModeratorsJson(pool);
        initRestosModifieXML(pool);
        initRestaurateurJson(pool);
        initRemovedCommentsTSV(pool);
        console.log('Data inserted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
function initCustomersJson(pool) {
    fs.readFile('../db/customers.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let customers = JSON.parse(data);
        let pwd = hashPwd(pwdUsers);

        customers.forEach(async (customer) => {
            const { firstname, lastname, address } = customer;
            const { street, number, zipcode, city, country } = address;

            let query = {
                text: `
                    INSERT INTO projet.Client (IdClient,MotDePasse,Nom, Prenom, Rue, Numero, Ville,CodePostal , Pays)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING IdClient;`,
                values: [generateUniqueId(), pwd, lastname, firstname, street, number, zipcode, city, country],
            };

            let result = await pool.query(query)
                .catch(async error => {
                    // await pool.query('ROLLBACK');
                    console.error('Error inserting data:', error);
                    throw error;
                })
        });
    });
}

function initModeratorsJson(pool) {
    fs.readFile('../db/moderators.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let moderators = JSON.parse(data);
        let pwd = hashPwd(pwdUsers);

        moderators.forEach(async (moderator) => {
            const { firstname, lastname, address } = moderator;
            const { street, number, zipcode, city, country } = address;

            let getClientQuery = {
                text: `
                    SELECT c.IdClient
                    FROM projet.client AS c 
                    WHERE c.Nom =$1 AND  c.Prenom =$2 AND c.Rue=$3 AND c.Numero=$4 AND c.Ville=$5 AND c.CodePostal=$6 AND c.Pays=$7
                    `,
                values: [lastname, firstname, street, number, city, zipcode, country],
            };
            let createClientQuery = {
                text: `
                    INSERT INTO projet.Client (IdClient,MotDePasse,Nom, Prenom, Rue, Numero, Ville,CodePostal , Pays,Type, IdModerateur)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11)
                    ON CONFLICT ON CONSTRAINT unique_client DO NOTHING
                    RETURNING IdClient;`,
                values: [generateUniqueId(), pwd, lastname, firstname, street, number, zipcode, city, country, "Moderateur", generateUniqueId()],
            };
            let resultGetClientQuery = await pool.query(getClientQuery);
            if (resultGetClientQuery.rows[0]?.idclient != null) {//bug
                idClient = resultGetClientQuery.rows[0].idclient;
                let updateClientQuery = {
                    text: `
                        UPDATE projet.Client
                        SET IdModerateur = $1 AND Type = $2
                        WHERE IdClient = $3;`,
                    values: [generateUniqueId(), "Moderateur", idClient],
                };
                await pool.query(updateClientQuery);
            } else {
                await pool.query(createClientQuery);
            }
        });
    });
};

function initRestaurateurJson(pool) {
    fs.readFile('../db/restaurateur.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let restaurateurs = JSON.parse(data);
        let pwd = hashPwd(pwdUsers);

        restaurateurs.forEach(async (restaurateur) => {
            const { firstname, lastname, address, restaurant } = restaurateur;
            const { street, number, zipcode, city, country } = address;
            let idRestaurateur = generateUniqueId();
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
                    INSERT INTO projet.Client(IdClient,MotDePasse,Nom, Prenom, Rue, Numero, CodePostal, Ville, Pays, Type, IdRestaurateur) 
                    VALUES($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11) 
                    --ON CONFLICT (Nom, Prenom, Rue, Numero, Ville, CodePostal, Pays)
                    --DO NOTHING
                    RETURNING IdClient;`,
                values: [idClient, pwd, lastname, firstname, street, number, zipcode, city, country, "Restaurateur", idRestaurateur],
            };

            try {
                let resultGetClientQuery = await pool.query(getClientQuery);
                if (resultGetClientQuery.rows[0]?.idclient != null) {
                    idRestaurateur = resultGetClientQuery.rows[0].idclient;
                } else {
                    await pool.query(createClientQuery);
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
                // await pool.query('ROLLBACK');
                console.error('Error inserting data:', error);
                throw error;
            }
        });
    });
}
async function initRestosModifieXML(pool) {
    let xmlData = await fs.promises.readFile('../db/restos_modifie.xml', 'utf8');
    let parser = new xml2js.Parser();
    let result = await parser.parseStringPromise(xmlData);

    let restaurants = result.restaurants.restaurant;
    for (let restaurant of restaurants) {
        let name = restaurant.name[0].toLowerCase().trim();
        let evaluation = parseFloat(restaurant.evaluation[0]);
        let delivery = restaurant.delivery[0].toLowerCase() === 'yes';
        let priceRange = restaurant.price_range[0].toLowerCase();
        let type = restaurant.type[0];
        let { city, country, number, street, zipcode } = restaurant.address[0];

        let restaurantQuery = {
            text: `INSERT INTO projet.Restaurant(Nom, Note, Livraison, Rue, Numero, CodePostal, Ville, Pays, GammePrix, Type) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)  ON CONFLICT(Nom) DO NOTHING
            RETURNING IdRestaurant`,
            values: [name, evaluation, delivery, street[0], number[0], zipcode[0], city[0], country[0], priceRange, type],
        };
        try {
            let resultQuery = await pool.query(restaurantQuery)
            let menuItems = restaurant.menu[0].dish;

            for (const menuItem of menuItems) {
                const { allergens, name, price } = menuItem;
                const idPlat = await insertPlat(pool, name[0], parseFloat(price[0].replace('€', '')));
                if (idPlat == null) continue; // record already exists 

                await insertMenuPlat(pool, resultQuery.rows[0].idrestaurant, idPlat);

                if (Array.isArray(allergens[0].allergen)) {
                    for (const allergen of allergens[0].allergen) {
                        await insertPlatAllergene(pool, idPlat, allergen);
                    }
                } else {
                    await insertPlatAllergene(pool, idPlat, allergens[0]);
                }
            }
        } catch (error) {
            // await pool.query('ROLLBACK');
            console.error('Error inserting data:', error);
            throw error;
        }
    }
}
async function insertPlat(pool, name, price) {
    let queryPlat = {
        text: 'INSERT INTO projet.Plat(Nom, Prix) VALUES($1, $2) ON CONFLICT (Nom,Prix) DO NOTHING RETURNING IdPlat',
        values: [name, price],
    };
    //returns null if already existing
    return pool.query(queryPlat)
        .then(result => result.rows[0]?.idplat)
        .catch(async error => {
            await pool.query('ROLLBACK');
            console.error('Error inserting data:', error);
            throw error;
        });
}
async function insertMenuPlat(pool, idRestaurant, idPlat) {
    // console.log(idPlat)
    await pool.query('INSERT INTO projet.Menu(IdRestaurant,IdPlat) VALUES($1,$2)  ', [idRestaurant, idPlat])
        .catch(async error => {
            await pool.query('ROLLBACK');
            console.error('Error insertMenuPlat:', error);
            throw error;
        });
}
async function insertPlatAllergene(pool, idPlat, allergen) {
    let idAllergene;
    let query = {
        text: 'INSERT INTO projet.Allergene(Nom) VALUES($1) ON CONFLICT (Nom) DO NOTHING RETURNING IdAllergene',
        values: [allergen],
    };
    try {
        let rows = await pool.query(query)
            .then(result => {
                if (result.rows.length > 0) {
                    idAllergene = result.rows[0].idallergene;
                }
            })
        if (idAllergene) {
            await pool.query('INSERT INTO projet.PlatAllergene(IdPlat, IdAllergene) VALUES($1, $2)', [idPlat, idAllergene]);
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error insertPlatAllergene:', error);
        throw error;
    }
}

async function initRemovedCommentsTSV(pool) {
    let tableData = readTSVFile('../db/removed_comments.tsv')
        .then(async tableData => {
            // console.log('Table Data:', tableData);
            for (const row of tableData) {
                await insertNote(pool, row);
                //TODO add traceavis
            }
        })
        .catch(error => {
            console.error('Error reading TSV file:', error);
            throw error;
        });
}

async function insertNote(pool, data) {
    if (data.length <= 1) return;

    let idRestaurant = await getIdRestaurantByName(pool, data[4]?.trim());
    let fullname = data[11].split(" ");
    let idClient = await getIdClientByName(pool, fullname[0]?.trim(), fullname[1]?.trim());
    if (!idRestaurant || !idClient) {
        // console.error('Error: Invalid restaurant or client name');
        return;
    }
    let { formattedDate, formattedTime } = parseDateTime(data[2]);
    let plats = data[7].split(";");

    let query = {
        text: `INSERT INTO projet.Note (
            Commentaire,
            ValeurNote,
            Date,
            HeureDebut,
            AvisRecommendation,
            IdRestaurant,
            AvisPhysique,
            PrixTotal,
            IdClient,
            TypeVisite,
            Active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) `,
        values: [
            data[0],   // Review/Commentaire
            parseFloat(data[1]),  // Rating/ValeurNote
            formattedDate,  // Date   new Date(data[6]),  // Visit Date
            formattedTime,
            data[3],   // Recommendation/AvisRecommendation
            idRestaurant,   // Restaurant ID
            parseFloat(data[5].split(':')[1].trim()),  // Service Review/AvisPhysique
            parseFloat(data[8]),  // Total Price/PrixTotal
            idClient,  // Client ID
            "Physique",
            0
        ]
    };
    try {
        let res = await pool.query(query);

        for (const platName of plats) {
            const idPlat = await getIdPlatByName(pool, platName.trim());
            if (idPlat) {
                await insertNotePlat(pool, idRestaurant, idClient, idPlat);
            } else {
                console.error(`Error: Plat not found for name ${platName}`);
            }
        }
        // console.log('Note inserted successfully');
    } catch (error) {
        console.error('Error inserting Note:', error);
        // await pool.query('ROLLBACK');
        throw error;
    }
}
async function insertNotePlat(pool, idRestaurant, idClient, idPlat) {
    const query = {
        text: `INSERT INTO projet.NotePlat (IdRestaurant,IdClient, IdPlat) VALUES ($1, $2, $3) ON CONFLICT (IdRestaurant,IdClient, IdPlat) DO NOTHING`,
        values: [idRestaurant, idClient, idPlat]
    };

    try {
        await pool.query(query);
    } catch (error) {
        console.error('Error inserting NotePlat:', error);
        await pool.query('ROLLBACK');
    }
}
async function getIdPlatByName(pool, name) {
    const query = {
        text: `SELECT IdPlat FROM projet.Plat WHERE Nom =$1`,
        values: [name]
    };
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows[0].idplat : null;
}
async function getIdRestaurantByName(pool, name) {
    try {
        const queryRestaurant = {
            text: `SELECT IdRestaurant FROM projet.Restaurant WHERE Nom = $1`,
            values: [name.toLowerCase().trim()]
        };
        // console.log("Query:", name.toLowerCase());
        const res = await pool.query(queryRestaurant);
        // console.log("Query Result:", res.rows);
        if (res.rows[0] == null) {
            console.log("Restaurant not found:", name.toLowerCase().trim());
            return null;
        }
        return res.rows[0].idrestaurant;
    } catch (error) {
        console.error('Error in getIdRestaurantByName:', error);
    }
}

async function getIdClientByName(pool, name, lastname) {
    // console.log("client" + name + lastname)

    let query = {
        text: 'SELECT IdClient FROM projet.Client WHERE Prenom =$1 AND  Nom =$2',
        values: [name, lastname]
    };
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows[0].idclient : null;
}
function readTSVFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const lines = data.split('\n');
            const tableData = lines.map(line => line.split('\t'));
            resolve(tableData);
        });
    });
}
function parseDateTime(dateTimeString) {
    let date = new Date(dateTimeString);
    let formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    let formattedTime = date.toTimeString().split(' ')[0]; // HH:MM:SS

    return { formattedDate, formattedTime };
}
function generateUniqueId() {
    return uuidv4();
}
function hashPwd(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(password)
        .digest('hex');;
}
module.exports = {
    hashPwd, initDb, generateUniqueId
};