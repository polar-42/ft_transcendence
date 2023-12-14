import { checkConnexion, logout } from "./authApp.js";


export function initHomePage()
{
    document.getElementsByClassName("Login")[0].addEventListener("click", debug)
    document.getElementsByClassName("SignIn")[0].addEventListener("click", logout)
}

async function debug(event)
{
    event.preventDefault();
    console.log(await checkConnexion())
}
