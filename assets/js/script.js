import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
//Importar el archivo de registro
import "./signupForm.js";
import "./googleLogin.js";
import "./signinForm.js";
import "./githubLogin.js";

//Manejo de la autenticación
//Cada ves que se cambie la autenticacion va a aparecer eso
onAuthStateChanged(auth, async (user) => {
  console.log(user);
  // Guardamos el usuario en el localstorage
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("email", JSON.stringify(email));
  localStorage.setItem("photoURL", JSON.stringify(photoURL));

});

// Esperar a que el documento esté listo
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("register-button");
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");

  button.addEventListener("click", (e) => {
    e.preventDefault();

    // Visibilidad de los formularios
    if (signupForm.style.display === "none") {
      signupForm.style.display = "block";
      signinForm.style.display = "none";
    } else {
      signupForm.style.display = "none";
      signinForm.style.display = "block";
    }
  });
});
