"use strict";

import { RedirectUrl } from "./Router";
import RestaurantComponent from "./RestaurantComponent";

let allRestaurantsArray = []

const RestaurantsPage = async () => {

    document.getElementById('page').innerHTML = `
    <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
    <div class="container mt-5">
        <div class="row" id="restaurantGrid"></div>
    </div>

   `;
    await loadRestaurantsGrid().then(() => {
        let btns = document.querySelectorAll(".btn.btn-primary");
        btns.forEach(e => e.addEventListener("click", viewRestaurant))
    })

};
let viewRestaurant = (e) => {
    let idChannel = e.target.attributes["id"].value;
    RestaurantComponent(idChannel, allRestaurantsArray);
}
const loadRestaurantsGrid = async () => {
    const grid = document.getElementById('restaurantGrid');
    allRestaurantsArray = await getAllRestaurants();
    allRestaurantsArray.forEach(restaurant => {
        // IdRestaurant , IdRestaurateur ,Nom ,Type, GammePrix ,Note, Heures ,Livraison ,Rue ,Numero, Ville, CodePostal, Pays 
        const col = document.createElement('div');
        col.className = 'col-md-4';

        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i >= Math.round(restaurant.note)) {
                starsHtml += '<span class="fa fa-star "></span>';
            } else {
                starsHtml += '<span class="fa fa-star checked"></span>';
            }
        }

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
                    <input type="button" class="btn btn-primary" value="View Details" id="${restaurant.idrestaurant}">
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

const getAllRestaurants = async () => {
    try {
        let response = await fetch(process.env.BASE_URL + "/restaurants/", {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok) {
            throw new Error(`getAllRestaurants: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        return data;
    } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        onError(err);
        return [];
    }
}
const onError = (err) => {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    messageBoard.classList.add("d-block");
};

export default RestaurantsPage;