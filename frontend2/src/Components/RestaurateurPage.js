"use strict";

import { RedirectUrl } from "./Router";
import { onError, handleStarRating } from "../utils/common";
import { getUserSessionData } from "../utils/session";
import RestaurantComponent from "./RestaurantComponent";

let myRestaurants = [];
const RestaurateurPage = async () => {
    document.getElementById('page').innerHTML = `
    <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
    <div class="container mt-5">
        <div class="row" id="restaurantGrid"></div>
    </div>
   `;
    await loadRestaurantsGrid()

};

const loadRestaurantsGrid = async () => {
    let restaurantGrid = document.getElementById("restaurantGrid");
    myRestaurants = await getMyRestaurants();
    myRestaurants.forEach(restaurant => {
        // IdRestaurant , IdRestaurateur ,Nom ,Type, GammePrix ,Note, Heures ,Livraison ,Rue ,Numero, Ville, CodePostal, Pays 
        const col = document.createElement('div');
        col.className = 'col-md-4';

        let starsHtml = handleStarRating(restaurant.note);

        let deliveryInfo = (restaurant.livraison) ? '<p class="card-text">Livraison disponible</p>' : '<p class="card-text">Livraison indisponible</p>';

        col.innerHTML = `
            <div class="card restaurant-card">
                <img src="https://via.placeholder.com/300x200" class="card-img-top" alt="${restaurant.nom}">
                <div class="card-body" id="${restaurant.idrestaurant}">
                    <h5 class="card-title">${restaurant.nom}</h5>
                    <p class="card-text">Type de cuisine :${restaurant.type}</p>
                    <p class="card-text">Gamme de prix : ${restaurant.gammeprix}</p>
                    <p class="card-text">Note: ${starsHtml}</p>
                    ${deliveryInfo}
                    <p class="card-text"><small class="text-muted">${restaurant.rue} ${restaurant.numero} ${restaurant.ville} ${restaurant.codepostal} ${restaurant.pays} </small></p>
                    <input type="button" class="btn btn-primary" value="Voir avis" id="${restaurant.idrestaurant}">
                </div>
            </div>
        `;
        restaurantGrid.appendChild(col);
    });

    let submitButtons = document.querySelectorAll(".btn.btn-primary");
    submitButtons.forEach(e => e.addEventListener("click", viewRestaurant))

}

const viewRestaurant = (e) => {
    let idRestaurant = e.target.attributes["id"].value;
    const actualRestaurant = myRestaurants.find(restaurant => restaurant.idrestaurant = idRestaurant)

    RestaurantComponent(actualRestaurant);
}


const getMyRestaurants = async () => {
    try {
        let idClient = getUserSessionData().idclient
        let response = await fetch(process.env.BASE_URL + "/restaurateurs/" + idClient, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok) {
            throw new Error(`getMyRestaurants: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        return data;
    } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        onError(err);
        return [];
    }
}

export default RestaurateurPage;