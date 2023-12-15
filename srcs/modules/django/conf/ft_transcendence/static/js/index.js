import { checkConnexion, initLoggin, initRegister } from "./authApp.js";
import { initMatchmaking } from "./battleshipApp.js";
import { initMatchmakingPong } from "./pongGameApp.js";
import { initLocalGamePong } from "./pongGameLocal.js";
import { initGamePongIA } from './pongGameIA.js';
import { initDashboard } from "./dashboard.js";
import { initHomePage} from "./homepage.js";
import { initGame } from "./game.js";
import { initGamePong, unLoadGamePong } from "./pongGame.js";

export function navto(urlpath)
{
	console.log(urlpath)
	history.pushState(null, null, urlpath);
	router([].slice.call(arguments, 1));
}

const navigateTo = url =>
{
	history.pushState(null, null, url);
	router(null);
}


function getRoute(RoutePath)
{
	const routes = [
		{ path: "/404", init: null, unload: null, title:"404", LogStatus: 2},
		{ path: "/needlog", init: null, unload: null, title:"Login required", LogStatus: 0},
		{ path: "/", init: initHomePage, unload: null, title:"Home", LogStatus: 2},
		{ path: "/dashboard", init: initDashboard, unload: null, title:"Home", LogStatus: 2},
		{ path: "/battleship", init: initGame, unload: null, title:"Battleship", LogStatus: 1},
		{ path: "/battleship/matchmake", init: initMatchmaking, unload: null, title:"Battleship", LogStatus: 1},
		{ path: "/pongGame", init: initGamePong, unload: unLoadGamePong, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/pongMatchmaking", init: initMatchmakingPong, unload: null, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/localPongGame", init: initLocalGamePong, unload: null, title:"pongGame", LogStatus: 1},
		{ path: "/pongGame/pongGameIA", init: initGamePongIA, unload: null, title:"pongGame", LogStatus: 1},
		{ path: "/authApp/login",init: initLoggin, unload: null, title:"Login", LogStatus: 0},
		{ path: "/authApp/register", init: initRegister, unload: null, title:"Register", LogStatus: 0},
	];

	const Potentialroutes = routes.map(route =>
		{
			return {
				route: route,
				isMatch: RoutePath === (document.location.origin + route.path)
			};
		});
	let match = Potentialroutes.find(route => route.isMatch);
	return match;
}

async function OnLogChange()
{
	var logStatus = await checkConnexion()
	document.querySelectorAll('.nav__link').forEach(function(button) {
		let match = getRoute(button.href);
		// if (match == null || (match.route.LogStatus == 1 && logStatus == false) || match.route.LogStatus == 0 && logStatus == true)
		// 	button.style.display = "none";
		// else
		// 	button.style.display = "block";
	});
}

let Prev_match = undefined

const router = async (arg) =>
{
	let match = getRoute(document.location.origin + location.pathname);
	/* define 404 error page */
	if (!match)
	{
		match = getRoute(document.location.origin + "/404");
	}
	else if (match.route.LogStatus == 1 && await checkConnexion() == false)
	{
		match = getRoute(document.location.origin + "/needlog");
	}
	else if (match.route.LogStatus == 0 && await checkConnexion() == true)
		match = getRoute(document.location.origin + "/");
	var response;
	if (match.route.path == "/")
	{
		response = await fetch(match.route.path + "homepage/?valid=True");
	}
	else
	{
		response = await fetch(match.route.path + "/?valid=True");
	}
	if (Prev_match != undefined && Prev_match.route.unload != null)
		Prev_match.route.unload()
	document.title = match.route.title
	document.querySelector("#app").innerHTML = await response.text();
	if (match.route.init != null)
		match.route.init(arg)
	Prev_match = match;
	OnLogChange();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () =>
{
	document.body.addEventListener("click", e =>
	{
		if (e.target.matches("[data-link]"))
		{
			e.preventDefault();
			navigateTo(e.target.href);
		}
	});
	router();
});

