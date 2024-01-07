import { checkConnexion, initLoggin, initRegister, logout } from "./authApp.js"
import { initMatchmaking } from "./battleshipApp.js"
import { initMatchmakingPong, unLoadMatchmakingPong } from "./pongGameApp.js"
import { initLocalGamePong } from "./pongGameLocal.js"
import { initGamePongIA, unloadGamePongIA } from './pongGameIA.js'
import { initDashboard } from "./dashboard.js"
import { initHomePage} from "./homepage.js"
import { CP_Unload, initGame } from "./BattleshipGame.js"
import { initGamePong, unLoadGamePong } from "./pongGameRemote.js"
import { initTournamentsCreation } from "./tournaments/tournamentsCreation.js"
import { initTournamentsJoinPage } from "./tournaments/tournamentsJoinPage.js"
import { initTournaments } from "./tournaments/tournament.js"

export function navto(urlpath)
{
	history.pushState(null, null, urlpath)
	router([].slice.call(arguments, 1))
}

const navigateTo = url =>
{
	history.pushState(null, null, url)
	router(null)
}


function getRoute(RoutePath)
{
	const routes = [
		{ path: "/404", init: null, unload: null, title:"404", LogStatus: 2},
		{ path: "/needlog", init: null, unload: null, title:"Login required", LogStatus: 0},
		{ path: "/", init: initHomePage, unload: null, title:"Home", LogStatus: 2},
		{ path: "/dashboard", init: initDashboard, unload: null, title:"Home", LogStatus: 2},
		{ path: "/battleship", init: initGame, unload: CP_Unload, title:"Battleship", LogStatus: 1},
		{ path: "/battleship/matchmake", init: initMatchmaking, unload: null, title:"Battleship", LogStatus: 1},
		{ path: "/pongGame/Remote", init: initGamePong, unload: unLoadGamePong, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/Home", init: initMatchmakingPong, unload: unLoadMatchmakingPong, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/Local", init: initLocalGamePong, unload: null, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/IA", init: initGamePongIA, unload: unloadGamePongIA, title:"pongGame", LogStatus: 1},
		{ path: "/tournaments/Home", init: null, unload: null, title:"initTournaments", LogStatus: 1},
		{ path: "/tournaments/Create", init: initTournamentsCreation, unload: null, title:"initTournaments", LogStatus: 1},
		{ path: "/tournaments/Join", init: initTournamentsJoinPage, unload: null, title:"Join Tournaments", LogStatus: 1},
		{ path: "/tournaments/Play", init: initTournaments, unload: null, title:"Tournament", LogStatus: 1},
		{ path: "/authApp/login", init: initLoggin, unload: null, title:"Login", LogStatus: 0},
		{ path: "/authApp/register", init: initRegister, unload: null, title:"Register", LogStatus: 0},
	]

	const Potentialroutes = routes.map(route =>
		{
			return {
				route: route,
				isMatch: RoutePath === (document.location.origin + route.path)
			}
		})
	let match = Potentialroutes.find(route => route.isMatch)
	return match
}

// async function OnLogChange()
// {
// 	var logStatus = await checkConnexion()
// 	document.querySelectorAll('.nav__link').forEach(function(button) {
// 		let match = getRoute(button.href)
// 		if (match == null || (match.route.LogStatus == 1 && logStatus == false) || match.route.LogStatus == 0 && logStatus == true)
// 			button.style.display = "none"
// 		else
// 			button.style.display = "block"
// 	})
// }
//
let Prev_match = undefined

const router = async (arg) =>
{
	let match = getRoute(document.location.origin + location.pathname)
	/* define 404 error page */
	if (!match)
	{
		match = getRoute(document.location.origin + "/404")
	}
	else if (match.route.LogStatus == 1 && await checkConnexion() == false)
	{
		match = getRoute(document.location.origin + "/needlog")
	}
	else if (match.route.LogStatus == 0 && await checkConnexion() == true)
		match = getRoute(document.location.origin + "/")
	var actualRoute
	if (match.route.path == "/")
		actualRoute = match.route.path + "homepage/?valid=True"
	else
		actualRoute = match.route.path + "/?valid=True"
	if (Prev_match != undefined && Prev_match.route.unload != null)
		Prev_match.route.unload()
	fetch(actualRoute)
	.then(Response => {
		document.title = match.route.title
		return Response.text()
	})
	.then(html => {
		document.querySelector("#app").innerHTML = html
	})
	.then(value => 
	{
		if (match.route.init != null)
			match.route.init(arg)
		Prev_match = match
		// OnLogChange()
	})
}


window.addEventListener("popstate", router)

document.addEventListener("DOMContentLoaded", () =>
{
	document.body.addEventListener("click", e =>
	{
		if (e.target.matches("[data-link]"))
		{
			e.preventDefault()
			navigateTo(e.target.href)
		}
	})
	router()
})

document.querySelector("button[name='logout']").addEventListener("click", logout)

const menuBtn = document.querySelector(".menu_btn")
const dropDownMenu = document.querySelector(".dropdown_menu")

menuBtn.addEventListener("click", () => {
  dropDownMenu.classList.toggle('open')
  const isOpen = dropDownMenu.classList.contains('open')

 menuBtn.src = isOpen ? '../static/assets/logo/cross.png' : '../static/assets/logo/hamburger.png';
});

const menuLink = document.querySelectorAll(".menu_link");
for (let link of menuLink) {
  link.addEventListener("click", () => {
    dropDownMenu.classList.remove('open');
    menuBtn.src = '../static/assets/logo/hamburger.png';
  });
}

const profileButton = document.querySelectorAll(".profile_button");
const profileDropDown  = document.querySelector(".profile_menu");

for (let button of profileButton) {

  button.addEventListener("click", async () => {
    let logStatus = await checkConnexion();
    if (logStatus == true) {
      console.log("here");
      // navto("/dashboard");
      profileDropDown.classList.toggle("active");
    } else {
      navto("/authApp/login");
    }
  })
}
