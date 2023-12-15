import { checkConnexion, logout } from "./authApp.js";


export function initHomePage()
{
    document.querySelector("button[type=LogIn]").addEventListener("click", debug)
    document.querySelector("button[type=SignIn]").addEventListener("click", logout)
}

async function debug(event)
{
    event.preventDefault();
    console.log(await checkConnexion())
}
