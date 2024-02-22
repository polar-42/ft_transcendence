import { checkConnexion } from "./authApp.js";
import { navto } from "./index.js";
import { sleep } from "./chatApp/CA_General.js";

export function initHomePage()
{
    let logInBtn = document.querySelector("button[name='LogIn']")
    let signInBtn = document.querySelector("button[name='SignIn']");
    logInBtn.addEventListener("click", async () => {
      let logStatus = await checkConnexion();
      if (logStatus == true) {
        displayLoggedInPopup()
      } else {
        navto("authApp/login");
      }
    });
    signInBtn.addEventListener("click", async () => {
      let logStatus = await checkConnexion();
      if (logStatus == true) {
        displayLoggedInPopup()
      } else {
        navto("/authApp/register");
      }
    })
}

async function displayLoggedInPopup() {
  let popup = document.querySelector('.popup')
  popup.style.display = 'flex'
  popup.style.transition = '4s ease'
  await sleep(1000)
  popup.style.opacity = '0'
  await sleep(3000)
  popup.style.display = 'none' 
  popup.style.opacity = '1'
}

async function debug(event)
{
  event.preventDefault();
  // console.log(await checkConnexion())
}
