import { navto } from "./index.js";

export function initNeedLogPage()
{
    document.querySelector(".login_btn").addEventListener('click', () => {
        navto("authApp/login");
    });
}