
import { RedirectUrl } from "./Router";
const BASE_URL = "http://localhost:3000";

let loginPage = `
<div class="container mt-5">
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card">
            <div class="card-body">
                <h2 class="text-center mb-4">Connexion</h2>
                <form>
                    <div class="form-group">
                        <label>Identifiant <span class="text-danger">*</span></label>
                        <input class="form-control" id="idClient" type="text" name="nom" placeholder="Entrez votre identifiant" required>
                    </div>

                    <div class="form-group">
                        <label>Mot de passe <span class="text-danger">*</span></label>
                        <input class="form-control" id="motDePasse" type="password" name="motDePasse" placeholder="Entrez votre mot de passe" required pattern=".*[A-Z]+.*">
                    </div>
                   
                    <button type="submit" id="login" class="btn btn-success btn-block">Connexion</button>
                    <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
                </form>
                <br>
                <p><u>Vous n'avez pas de compte?</u></p>
                <button type="button" id="register" class="btn btn-success btn-block">Inscription</button>
            </div>
        </div>
    </div>
</div>
</div>`;

const LoginPage = () => {
    document.getElementById('page').innerHTML = loginPage;

    let loginForm = document.querySelector("form");
    loginForm.addEventListener("submit", onLogin);

    let registerButton = document.getElementById("register");
    registerButton.addEventListener("click", () => {
        RedirectUrl("/register");

    })
};
const onLogin = (e) => {
    e.preventDefault();
    let user = {
        idClient: document.getElementById("idClient").value,
        motDePasse: document.getElementById("motDePasse").value,
    };
    fetch(BASE_URL + "/login", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok)
                throw new Error(
                    "Error code : " + response.status + " : " + response.statusText
                );
            return response.json();
        })
        .then((data) => onUserLogin(data))
        .catch((err) => onError(err));
};

const onUserLogin = (userData) => {
    console.log("onUserLogin:", userData);
    RedirectUrl("/");
};

const onError = (err) => {
    console.error("error dans le onError", err);
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = "";
    if (err.message.includes("401")) errorMessage = "Wrong username or password.";
    else errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    // show the messageBoard div (add relevant Bootstrap class)
    messageBoard.classList.add("d-block");
};

export default LoginPage;