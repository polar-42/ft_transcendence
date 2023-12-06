import { checkConnexion, initLoggin, initRegister } from "./authApp.js";
import { initMatchmaking } from "./battleshipApp.js";
import { initDashboard } from "./dashboard.js";
import { initGame } from "./game.js";

export function navto(urlpath)
{
	navigateTo(urlpath);
}

const navigateTo = url =>
{
	history.pushState(null, null, url);
	router();
}



function getRoute(RoutePath)
{
	const routes = [
		{ path: "/404", init: null, unload: null, title:"404", LogStatus: 2},
		{ path: "/needlog", init: null, unload: null, title:"Login required", LogStatus: 0},
		{ path: "/", init: initDashboard, unload: null, title:"Home", LogStatus: 2},
		{ path: "/battleship", init: initGame, unload: null, title:"Battleship", LogStatus: 1},
		{ path: "/battleship/matchmake", init: initMatchmaking, unload: null, title:"Battleship", LogStatus: 1},
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
		if (match == null || (match.route.LogStatus == 1 && logStatus == false) || match.route.LogStatus == 0 && logStatus == true)
			button.style.display = "none";
		else
			button.style.display = "block";
	});
}

const router = async () => 
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
		response = await fetch(match.route.path + "dashboard/?valid=True");
	}
	else
	{
		response = await fetch(match.route.path + "/?valid=True");
	}
	document.title = match.route.title
	document.querySelector("#app").innerHTML = await response.text();
	if (match.route.init != null)
		match.route.init()
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