"use strict";

import { RedirectUrl } from "./Router";


const RestaurantComponent = (idRestaurant, allRestaurantsArray) => {
    console.log(allRestaurantsArray)
    let actualRestaurant = allRestaurantsArray.find(restaurant => restaurant.idrestaurant = idRestaurant)
    console.log(actualRestaurant)
    document.getElementById('page').innerHTML = idRestaurant;

};


export default RestaurantComponent;