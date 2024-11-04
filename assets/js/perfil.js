const user = JSON.parse(localStorage.getItem("user"));
const email = JSON.parse(localStorage.getItem("email"));
const photoURL = JSON.parse(localStorage.getItem("photoURL"));

console.log(user);
console.log(email);

document.getElementById("name").innerText = user.displayName;
document.getElementById("email").innerText = user.email;
document.getElementById("photoURL").src =
  user.photoURL || "./assets/img/defaultProfile.png";
