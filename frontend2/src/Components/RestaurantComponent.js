"use strict";

import { RedirectUrl } from "./Router";
import { onError, formatDate, handleStarRating } from "../utils/common";
import { getUserSessionData } from "../utils/session";

let restaurant = null;

const RestaurantComponent = async (actualRestaurant) => {
    restaurant = actualRestaurant;
    const restaurateur = await getClient(actualRestaurant.idrestaurateur);
    let isRestaurateur = (getUserSessionData().type == "Restaurateur");
    console.log("actualRestaurant", actualRestaurant);

    let starsHtml = handleStarRating(actualRestaurant.note);
    let deliveryInfo = (actualRestaurant.livraison) ? '<p class="card-text">Livraison disponible</p>' : '<p class="card-text">Livraison indisponible</p>';

    document.getElementById('page').innerHTML = `
    <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
    <div class="container">
        <div class="row mt-5" id ="upperSection">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${actualRestaurant.nom}</h5>
                        <p class="card-text">Type de cuisine: ${actualRestaurant.type}</p>
                        <p class="card-text">Gamme de prix: ${actualRestaurant.gammeprix}</p>
                        <p class="card-text">Note: ${starsHtml} </p>
                        ${deliveryInfo}
                        <p class="card-text">Adresse: ${actualRestaurant.rue} ${actualRestaurant.numero} ${actualRestaurant.ville} ${actualRestaurant.codepostal} ${actualRestaurant.pays}</p>
                        <p class="card-text">Restaurateur: ${restaurateur.nom} ${restaurateur.prenom}</p>

                    </div>
                </div>
            </div>
            <div class="col-md-6" id ="addReview"></div>
        </div>
        <div class="row mt-5" id="allreviews" ></div>
    </div>
    `;
    if (!isRestaurateur) showAddReviewComponent(actualRestaurant); // restaurateur cant add review to his own restaurant

    await getAllReviews(actualRestaurant.idrestaurant)
};
const showAddReviewComponent = (actualRestaurant) => {
    let addReviewHtml = `
        <div class="card">
        <div class="card-body">
        <h5 class="card-title">Ajouter un commentaire</h5>
        <form id="addCommentForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="commentaire">Commentaire<span class="text-danger">*</span></label>
                        <textarea class="form-control" id="commentaire" name="commentaire" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="valeurNote">Note<span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="valeurNote" name="valeurNote" min="0" max="5" required>
                    </div>
                    <div class="form-group">
                        <label for="avisRecommendation">Recommendation<span class="text-danger">*</span></label>
                        <select class="form-control" id="avisRecommendation" name="avisRecommendation" required>
                            <option value="recommandé">Recommandé</option>
                            <option value="déconseillé">Déconseillé</option>
                            <option value="à éviter d'urgence">À éviter d'urgence</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="typeVisite">Type de visite<span class="text-danger">*</span></label>
                        <select class="form-control" id="typeVisite" name="typeVisite" required>
                            <option value="physique">Physique</option>
                            <option value="livraison">Livraison</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="avisPhysiqueOrLivraison">Avis physique/livraison<span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="avisPhysiqueOrLivraison" name="avisPhysiqueOrLivraison" min="0" max="5" required>
                    </div>
                    <div class="form-group">
                        <label for="date">Date<span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="heureDebut">Heure de début<span class="text-danger">*</span></label>
                        <input type="time" class="form-control" id="heureDebut" name="heureDebut" required>
                    </div>
                    <div class="form-group">
                        <label for="heureFin">Heure de fin<span class="text-danger">*</span></label>
                        <input type="time" class="form-control" id="heureFin" name="heureFin" required>
                    </div>
                    <div class="form-group">
                        <label for="prixTotal">Prix total<span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="prixTotal" name="prixTotal" min="0" step="0.01" required>
                    </div>
                </div>
            </div>
            <button type="button" id="${actualRestaurant.idrestaurant}" class="btn btn-primary">Ajouter</button>
        </form>
    </div>
    
  </div>
    `
    document.getElementById("addReview").innerHTML = addReviewHtml;
    let submitButton = document.querySelector(".btn.btn-primary");
    let form = document.getElementById("addCommentForm");
    submitButton.addEventListener("click", (e) => {
        // Perform manual validation since it's a SPA, we dont want the page to refresh
        if (form.checkValidity()) {
            addReview(e);
        } else {
            form.reportValidity(); // Shows validation messages
        }
    });

}
const addReview = async (e) => {
    let review = {
        idRestaurant: e.target.attributes["id"].value,
        idClient: getUserSessionData().idclient,
        commentaire: document.getElementById('commentaire').value,
        valeurNote: parseFloat(document.getElementById('valeurNote').value),
        avisRecommendation: document.getElementById('avisRecommendation').value,
        typeVisite: document.getElementById('typeVisite').value,
        avisPhysiqueOrLivraison: parseFloat(document.getElementById('avisPhysiqueOrLivraison').value),
        date: document.getElementById('date').value,
        heureDebut: document.getElementById('heureDebut').value,
        heureFin: document.getElementById('heureFin').value,
        prixTotal: parseFloat(document.getElementById('prixTotal').value)
    }

    try {
        let response = await fetch(process.env.BASE_URL + "/notes/" + review.idRestaurant + "/" + review.idClient, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(review),
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok) {
            throw new Error(`addReview: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        RestaurantComponent(restaurant);//refresh
    } catch (err) {
        console.error("Failed to addReview:", err);
        onError(err);
        return [];
    }
}

const getAllReviews = async (idRestaurant) => {
    try {
        let response = await fetch(process.env.BASE_URL + "/notes/" + idRestaurant, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok) {
            throw new Error(`loadAllReviews: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        displayAllReviews(data)
    } catch (err) {
        console.error("Failed to fetch reviews:", err);
        onError(err);
        return [];
    }
}
const getClient = async (idClient) => {
    try {
        let response = await fetch(process.env.BASE_URL + "/clients/" + idClient, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok) {
            throw new Error(`getClient: ${response.status} - ${response.statusText}`);
        }
        return await response.json();

    } catch (err) {
        console.error("Failed to fetch reviews:", err);
        onError(err);
        return null;
    }
}
const displayAllReviews = async (reviews) => {
    try {
        const reviewPromises = reviews.map(createReviewCard);
        const allReviewsHtml = await Promise.all(reviewPromises);
        document.getElementById("allreviews").innerHTML = allReviewsHtml.join('');
    } catch (err) {
        console.error("Failed to display reviews:", err);
        onError(err);
    }
};
const createReviewCard = async (review) => {
    const client = await getClient(review.idclient);
    let date = formatDate(review.date);
    let starsHtml = handleStarRating(review.valeurnote);

    return `
            <div class="col-md-4">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Avis de ${client.nom} ${client.prenom}</h5>
                        <p class="card-text"><strong>Commentaire:</strong> ${review.commentaire}</p>
                        <p class="card-text"><strong>Recommendation:</strong> ${review.avisrecommendation}</p>
                        <p class="card-text"><strong>Note:</strong> ${starsHtml}</p>
                        <p class="card-text"><strong>Type de visite:</strong> ${review.typevisite}</p>
                        <p class="card-text"><strong>Date:</strong> ${date} à ${review.heuredebut} </p>
                    </div>
                </div>
            </div>
        `;
};


export default RestaurantComponent;