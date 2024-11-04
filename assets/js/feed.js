import "./signOut.js";
import "./toastMessage.js";
import { setupTasks } from "./setupTasks.js";

const user = JSON.parse(localStorage.getItem("user"));

console.log(user);
setupTasks(user);
