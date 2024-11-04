import {
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { auth } from "./firebase.js";

const googleButton = document.querySelector("#google-btn");

googleButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account", // Forzar la selección de cuenta
  });

  try {
    const credentials = await signInWithPopup(auth, provider);

    localStorage.setItem("user", JSON.stringify(credentials.user));

    window.location.href = "./inicio.html";
  } catch (error) {
    console.log(error);
  }
});
