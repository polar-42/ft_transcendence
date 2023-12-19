import { checkConnexion, logout } from "./authApp.js";
import { navto } from "./index.js";

export function initHomePage()
{
    let logInBtn = document.querySelector("button[name='LogIn']")
    let signInBtn = document.querySelector("button[name='SignIn']");
    logInBtn.addEventListener("click", async () => {
      let logStatus = await checkConnexion();
      if (logStatus == true) {
        navto("/dashboard");
      } else {
        navto("authApp/login");
      }
    });
    signInBtn.addEventListener("click", async () => {
      let logStatus = await checkConnexion();
      if (logStatus == true) {
        navto("/dashboard");
      } else {
        navto("/authApp/register");
      }
    })
}

async function debug(event)
{
    event.preventDefault();
    console.log(await checkConnexion())
}
