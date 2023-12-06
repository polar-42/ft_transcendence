import { checkConnexion, logout } from "./authApp.js";


export function initDashboard()
{
    document.getElementsByClassName("checkConnexion_BTN")[0].addEventListener("click", debug)
    document.getElementsByClassName("logout_BTN")[0].addEventListener("click", logout)
}

async function debug(event)
{
    event.preventDefault();
    console.log(await checkConnexion())
}