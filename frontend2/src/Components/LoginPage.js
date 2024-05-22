
import { RedirectUrl } from "./Router";

let loginPage = `
<div class="sidenav">
         <div class="login-main-text">
            <h1>Projet BD</h1><br><br>
            <h2>Login Page</h2>
            <p>Veuillez vous connecter ou vous inscrire pour acceder a toutes les fonctionnalites du site.</p><br><br><br><br><br><br><br>
            
            
         </div>
      </div>
      <div class="main">
         <div class="col-md-6 col-sm-12">
            <div class="login-form">
               <form>
                  <div class="form-group">
                     <label>Email</label>
                      <input class="form-control" id="email" type="text" name="email" placeholder="Enter your email" required="" pattern="^\\w+([.-]?\\w+)*@\\w+([\.-]?\\w+)*(\\.\\w{2,4})+\$" />
                  </div>
                  <div class="form-group">
                     <label>Password</label>
                     <input class="form-control" id="password" type="password" name="password" placeholder="Enter your password" required="" pattern=".*[A-Z]+.*" />
                  </div>
                  <button type="submit" id="login" class="btn btn-success">Login</button>
                  <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div>
                  <br><br><p><u>Vous n'avez pas de compte?</u>
                  <button type="button" id="register" class="btn btn-success"  >Register</button></p>
               </form>
            </div>
        </div>

      </div>`;

const LoginPage = () => {
    document.getElementById('page').innerHTML = loginPage;

    let loginForm = document.querySelector("form");
    let registerButton = document.getElementById("register");
    registerButton.addEventListener("click", () => {
        RedirectUrl("/register");

    })
};
const onLogin = (e) => {

    e.preventDefault();
    let user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };
    console.log("fetch : " + user.email + " " + user.password); //OK
    fetch(API_URL + "users/login", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(user), // body data type must match "Content-Type" header
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
    const user = { ...userData, isAutenticated: true };
    setUserSessionData(user);
    Navbar();
    RedirectUrl("/");
};

const onError = (err) => {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = "";
    if (err.message.includes("401")) errorMessage = "Wrong username or password.";
    else errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    // show the messageBoard div (add relevant Bootstrap class)
    messageBoard.classList.add("d-block");
};

export default LoginPage;