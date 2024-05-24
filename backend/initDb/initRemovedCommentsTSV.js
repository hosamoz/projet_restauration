const { readTSVFile } = require('../utils')
const path = require('path');
const { getIdRestaurantByName, getIdClientByName, parseDateTime, getIdPlatByName } = require('../utils');

async function initRemovedCommentsTSV(pool) {
    let filePath = path.join(__dirname, 'data', 'removed_comments.tsv');
    try {
        let tableData = await readTSVFile(filePath);
        for (let row of tableData) {
            await insertNote(pool, row);
        }
    } catch (error) {
        console.error('Error reading TSV file:', error);
        throw error;
    };
}
async function insertNote(pool, data) {
    if (data.length <= 1) {
        console.error("Invalid row on TSV file", data);
        return
    }
    let idRestaurant = await getIdRestaurantByName(pool, data[4]?.trim());
    let fullname = data[11].split(" ");
    let idClient = await getIdClientByName(pool, fullname[0]?.trim(), fullname[1]?.trim());
    if (!idRestaurant || !idClient) {
        console.error('Error: Invalid restaurant or client name ||  client=', fullname[0] + " || restaurant: ", data[4]);
        return;
    }
    let { formattedDate, formattedTime } = parseDateTime(data[2]);
    let plats = data[7].split(";");
    let typeLivraisonEtNote = data[5].split(':');
    let isLivraison = typeLivraisonEtNote[0].toLowerCase().includes("delivery");
    let note = parseFloat(typeLivraisonEtNote[1].trim());
    let avisPhysiqueOrAvisLivraison = (isLivraison) ? "AvisLivraison" : "AvisPhysique";
    let raisonRetrait = data[12].trim();
    let dateRetrait = data[6].trim();

    let queryNote = {
        text: `INSERT INTO projet.Note (
            Commentaire,
            ValeurNote,
            Date,
            HeureDebut,
            AvisRecommendation,
            IdRestaurant,
            ${avisPhysiqueOrAvisLivraison},
            PrixTotal,
            IdClient,
            TypeVisite,
            Active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) `,
        values: [
            data[0],   //Commentaire
            parseFloat(data[1]),  //ValeurNote
            formattedDate,
            formattedTime,
            data[3],   // AvisRecommendation
            idRestaurant,
            note,
            parseFloat(data[8]),  // PrixTotal
            idClient,
            isLivraison ? "livraison" : "physique",
            0
        ]
    };
    try {
        await pool.query(queryNote);

        for (const platName of plats) {
            const idPlat = await getIdPlatByName(pool, platName.trim());
            if (idPlat) {
                await insertNotePlat(pool, idRestaurant, idClient, idPlat);
            } else {
                console.error(`Error: Plat not found for name ${platName}`);
            }
        }
        await createTraceAvis(pool, idRestaurant, idClient, raisonRetrait, dateRetrait); // should contain idModerateur but no data on the name of the moderators 
    } catch (error) {
        console.error('Error inserting Note:', error);
        await pool.query('ROLLBACK');
        throw error;
    }
}
//TODO in the future : if conflict on NotePlat -> note already existing then update the Note record
async function insertNotePlat(pool, idRestaurant, idClient, idPlat) {
    const query = {
        text: `INSERT INTO projet.NotePlat (IdRestaurant,IdClient, IdPlat) VALUES ($1, $2, $3) 
              ON CONFLICT (IdRestaurant,IdClient, IdPlat)
              DO NOTHING; 
               `, // 1 avis/client plat
        values: [idRestaurant, idClient, idPlat]
    };

    try {
        await pool.query(query);
    } catch (error) {
        console.error('Error inserting NotePlat:', error);
        await pool.query('ROLLBACK');
        throw error;
    }
}
async function createTraceAvis(pool, idRestaurant, idClient, raisonRetrait, dateRetrait) {
    const query = {
        text: `INSERT INTO projet.TraceAvis (IdRestaurant, IdClient, Raison, Date) VALUES ($1, $2, $3, $4) 
               `,
        values: [idRestaurant, idClient, raisonRetrait, dateRetrait]
    };

    try {
        await pool.query(query);
    } catch (error) {
        console.error('Error inserting TraceAvis:', error);
        await pool.query('ROLLBACK');
        throw error;
    }
}
module.exports = {
    initRemovedCommentsTSV
};