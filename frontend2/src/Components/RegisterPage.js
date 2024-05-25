"use strict"
import { RedirectUrl } from "./Router.js";

const BASE_URL = "http://localhost:3000";

let registerPage = `
<div class="container mt-5">
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card">
            <div class="card-body">
                <h2 class="text-center mb-4">Inscription</h2>
                <form>
                    <div class="form-group">
                        <label>Nom <span class="text-danger">*</span></label>
                        <input class="form-control" id="nom" type="text" name="nom" placeholder="Entrez votre nom" required>
                    </div>
                    <div class="form-group">
                        <label>Prenom <span class="text-danger">*</span></label>
                        <input class="form-control" id="prenom" type="text" name="prenom" placeholder="Entrez votre prenom" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe <span class="text-danger">*</span></label>
                        <input class="form-control" id="motDePasse" type="password" name="motDePasse" placeholder="Entrez votre mot de passe" required pattern=".*[A-Z]+.*">
                    </div>
                    <div class="form-group">
                        <label>Rue</label>
                        <input class="form-control" id="rue" type="text" name="rue" placeholder="Entrez votre rue">
                    </div>
                    <div class="form-group">
                        <label>Numero</label>
                        <input class="form-control" id="numero" type="text" name="numero" placeholder="Entrez votre numero">
                    </div>
                    <div class="form-group">
                        <label>Ville</label>
                        <input class="form-control" id="ville" type="text" name="ville" placeholder="Entrez votre ville">
                    </div>
                    <div class="form-group">
                        <label>Code postal</label>
                        <input class="form-control" id="codePostal" type="text" name="codePostal" placeholder="Entrez votre code postal">
                    </div>
                    <div class="form-group">
                    <label>Pays</label>
                    <input class="form-control" id="pays" type="text" name="pays" placeholder="Entrez votre pays">

                    <div class="form-group form-check">
                        <input type="checkbox" class="form-check-input" id="isRestaurateur">
                        <label class="form-check-label" for="isRestaurateur">Restaurateur?</label>
                    </div>
                    <div id="restaurantInfo" class="d-none">  
                        <div class="form-group">
                            <label> Nom du restaurant <span class="text-danger">*</span></label>
                            <input class="form-control" id="nomRestaurant" type="text" name="nomRestaurant" placeholder="Entrez le nom du restaurant" >
                        </div>
                    </div>
            
                </div>
                    <button type="submit" id="register" class="btn btn-success btn-block">Inscription</button>
                    <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
                </form>
                <br>
                <p><u>Vous avez deja un compte?</u></p>
                <button type="button" id="login" class="btn btn-success btn-block">Connexion</button>
            </div>
        </div>
    </div>
</div>
</div>`;

const RegisterPage = () => {
    let page = document.getElementById("page");
    page.innerHTML = registerPage;

    let registerForm = document.querySelector("form");
    registerForm.addEventListener("submit", onRegister);

    let loginButton = document.getElementById("login");
    loginButton.addEventListener("click", loginOnClick);

    let checkbox = document.getElementById("isRestaurateur");
    checkbox.addEventListener("change", onCheckboxRestaurateur);
};

const loginOnClick = () => {
    RedirectUrl("/login");
}
const onCheckboxRestaurateur = async (e) => {
    let restaurantInfo = document.getElementById('restaurantInfo');
    if (e.target.checked) {
        restaurantInfo.classList.remove('d-none');
    } else {
        restaurantInfo.classList.add('d-none');
    }
}
const onRegister = async (e) => {
    e.preventDefault();
    let user = {
        nom: document.getElementById("nom").value,
        prenom: document.getElementById("prenom").value,
        motDePasse: document.getElementById("motDePasse").value,
        rue: document.getElementById("rue").value,
        numero: document.getElementById("numero").value,
        ville: document.getElementById("ville").value,
        codePostal: document.getElementById("codePostal").value,
        pays: document.getElementById("pays").value,
        isRestaurateur: document.getElementById('isRestaurateur').checked,
        nomRestaurant: document.getElementById('nomRestaurant').value,
    };
    let messageBoard = document.querySelector("#messageBoard");

    try {
        let routeToChoose = user.isRestaurateur ? "/restaurateurs" : "/clients";
        let response = await fetch(BASE_URL.concat(routeToChoose, "/register"), {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!response.ok)
            throw new Error(response.status + " : " + response.statusText);

        let jsonResponse = await response.json();
        showGreenNotification("Here is your ID. Use it to login. \n " + jsonResponse);
    } catch (err) {
        console.error(err);
        messageBoard.innerText = err;
        // show the messageBoard div (add relevant Bootstrap class)
        messageBoard.classList.add("d-block");
    }
}

//utils
function showGreenNotification(message) {
    let messageBoard = document.querySelector("#messageBoard");

    messageBoard.innerText = message;
    messageBoard.classList.remove('d-none');
    messageBoard.classList.add('alert-success');
    messageBoard.classList.remove('alert-danger');
}

export default RegisterPage;