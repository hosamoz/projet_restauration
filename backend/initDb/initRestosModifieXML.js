const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function initRestosModifieXML(pool) {
    let filePath = path.join(__dirname, 'data', 'restos_modifie.xml');
    let xmlData = await fs.promises.readFile(filePath, 'utf8');
    let parser = new xml2js.Parser();
    let result = await parser.parseStringPromise(xmlData);

    let restaurants = result.restaurants.restaurant;
    for (let restaurant of restaurants) {
        let name = restaurant.name[0].toLowerCase();
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

            for (let menuItem of menuItems) {
                let { allergens, name, price } = menuItem;
                let idPlat = await insertPlat(pool, name[0], parseFloat(price[0].replace('€', '')));
                if (idPlat == null) continue; // record already exists 

                await insertMenuPlat(pool, resultQuery.rows[0].idrestaurant, idPlat);

                if (Array.isArray(allergens[0].allergen)) {
                    for (let allergen of allergens[0].allergen) {
                        await insertPlatAllergene(pool, idPlat, allergen);
                    }
                } else {
                    await insertPlatAllergene(pool, idPlat, allergens[0]);
                }
            }
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error inserting initRestosModifieXML:', error);
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
            console.error('Error inserting data insertPlat:', error);
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
        await pool.query(query)
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

async function insertMenuPlat(pool, idRestaurant, idPlat) {
    await pool.query('INSERT INTO projet.Menu(IdRestaurant,IdPlat) VALUES($1,$2)  ', [idRestaurant, idPlat])
        .catch(async error => {
            await pool.query('ROLLBACK');
            console.error('Error insertMenuPlat:', error);
            throw error;
        });
}
module.exports = {
    initRestosModifieXML
};