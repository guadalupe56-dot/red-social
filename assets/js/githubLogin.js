import {
  signInWithPopup,
  GithubAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { auth } from "./firebase.js";
import { showMessage } from "./toastMessage.js";

const githubButton = document.querySelector("#github-btn");

githubButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const provider = new GithubAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account", // Forzar la selección de cuenta
  });

  try {
    const credentials = await signInWithPopup(auth, provider);

    localStorage.setItem("user", JSON.stringify(credentials.user));

    window.location.href = "./inicio.html";
  } catch (error) {
    console.log(error);
    if (error.code === "auth/account-exists-with-different-credential") {
      showMessage("Cuenta ya registrada, iniciar sesión con Google", "error");
    } else {
      showMessage(error.message, "error");
    }
  }
});
