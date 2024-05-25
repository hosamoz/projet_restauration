const express = require('express');
const router = express.Router();
const { getAttributeOrEmpty, isEmpty } = require('../utils');

module.exports = (pool) => {
    router.post('/:idrestaurant/:idclient', async (req, res) => { //TODO if already note ->update
        const data = req.body;
        console.log(data)
        let idRestaurant = req.params.idrestaurant;
        let idClient = req.params.idclient;
        let commentaire = getAttributeOrEmpty(data, "commentaire");
        let valeurNote = data["valeurNote"];
        let avisRecommendation = getAttributeOrEmpty(data, "avisRecommendation");
        let typeVisite = getAttributeOrEmpty(data, "typeVisite");
        let avisPhysiqueOrLivraison = data["avisPhysiqueOrLivraison"];
        let date = data["date"] ?? new Date();
        let heureDebut = data["heureDebut"];
        let heureFin = data["heureFin"];
        let prixTotal = data["prixTotal"];

        // if (isEmpty(idRestaurant) || isEmpty(idClient) || isEmpty(commentaire) || isEmpty(valeurNote) || isEmpty(avisRecommendation)
        //     || isEmpty(typeVisite) || isEmpty(typeVisite))
        //     return res.status(422).json("Invalid data");

        let typeVisiteUpdateDb = "";
        if (typeVisite == 'physique')
            typeVisiteUpdateDb = 'AvisPhysique';
        else if (typeVisite == 'livraison')
            typeVisiteUpdateDb = 'AvisLivraison';
        else return res.status(422).json("Invalid typeVisite.")

        try {
            let query = {
                text: `
                INSERT INTO projet.Note (IdRestaurant, IdClient, Commentaire, ValeurNote, AvisRecommendation, TypeVisite, ${typeVisiteUpdateDb}, Date, HeureDebut, HeureFin, PrixTotal)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);
                      `,
                values: [idRestaurant, idClient, commentaire, valeurNote, avisRecommendation, typeVisite, avisPhysiqueOrLivraison, date, heureDebut, heureFin, prixTotal]
            }
            const result = await pool.query(query);

            res.status(200).json("Note inserted successfully.");
        } catch (err) {
            console.error(err);
            res.status(500).json('Server Error');
        }
    });
    router.get('/:idrestaurant', async (req, res) => {
        let idRestaurant = req.params.idrestaurant;

        try {
            let query = {
                text: `
                    SELECT *
                    FROM projet.Note
                    WHERE IdRestaurant = $1 AND Active=true
                    ORDER BY DATE DESC
                      `,
                values: [idRestaurant]
            }
            const result = await pool.query(query);
            res.status(200).json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json('Server Error');
        }
    });

    return router;
}
