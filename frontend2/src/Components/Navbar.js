import { getUserSessionData } from "../utils/session.js";


const Navbar = () => {

  let user = getUserSessionData();
  let navbar;

  if (!user) { // pas connecte
    navbar = `    
      <nav class="navbar navbar-expand-md fixed-top navbar-dark bg-dark">
        <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
        
          <ul class="navbar-nav mr-auto">      
            <li class="nav-item">
              <a class="nav-link"  data-uri="/login">Connexion <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
            <a class="nav-link"  data-uri="/register">Inscription <span class="sr-only">(current)</span></a>
            </li>
          </ul>
        </div>
      </nav>
          `;
  }
  else {
    navbar = `    
    <nav class="navbar navbar-expand-md fixed-top navbar-dark bg-dark">
      <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
      
        <ul class="navbar-nav mr-auto">      
          <li class="nav-item">
            <a class="nav-link"  data-uri="/restaurants">Accueil <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
          <a class="nav-link"  data-uri="/logout">Deconnexion <span class="sr-only">(current)</span></a>
          </li>
        </ul>
      </div>
    </nav>
        `;
  }
  document.getElementById("navBar").innerHTML = navbar

};

export default Navbar