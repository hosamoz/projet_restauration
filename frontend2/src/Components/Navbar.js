import { RedirectUrl } from "./Router";

// destructuring assignment
const Navbar = () => {
  console.log("dans navbar")
  let navbar;
  navbar = `    
  <nav class="navbar navbar-expand-md fixed-top navbar-dark bg-dark">
  <div class="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
  
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link" data-uri="/">Accueil <span class="sr-only">(current)</span></a>
      </li>
      
      <li class="nav-item">
        <a class="nav-link"  data-uri="/login">Login <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item">
      <a class="nav-link"  data-uri="/register">Register <span class="sr-only">(current)</span></a>
      </li>
    </ul>
  </div>
</nav>`;
  document.getElementById("navBar").innerHTML = navbar

};

export default Navbar;