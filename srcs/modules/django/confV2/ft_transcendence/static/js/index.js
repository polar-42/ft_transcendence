import { checkConnexion, initLoggin, initRegister, initSocket } from "./authApp.js";
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
		{ path: "/404", init: null, title:"404", LogStatus: 2},
		{ path: "/needlog", init: null, title:"Login required", LogStatus: 0},
		{ path: "/", init: initDashboard, title:"Home", LogStatus: 2},
		{ path: "/battleship", init: initGame, title:"Battleship", LogStatus: 1},
		{ path: "/authApp/login",init: initLoggin, title:"Login", LogStatus: 0},
		{ path: "/authApp/register", init: initRegister, title:"Register", LogStatus: 0},
		{ path: "/authApp/testSocket", init: initSocket, title:"Socket", LogStatus: 1},
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
    // var oldScript = document.querySelector("#ViewScript")
	// var script = await view.getJs()
	// if (script != "")
	// {
		// var newScript = document.createElement('script');
		// newScript.type = 'module';
		// newScript.id = 'ViewScript';
		// newScript.src = script;
		// if (oldScript != null)
			// oldScript.parentNode.replaceChild(newScript, oldScript);
		// else
			// document.body.appendChild(newScript);
	// }
	// else if (oldScript != null)
	// {
		// document.body.removeChild(oldScript);
	// }
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