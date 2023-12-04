import { initGame } from "./game.js";
let OldRoute = null;

let isLog = true;

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
		{ path: "/", init: null, title:"Home", LogStatus: 2},
		{ path: "/battleship", init: initGame, title:"Battleship", LogStatus: 1},
		{ path: "/authApp/login",init: null, title:"Login", LogStatus: 0},
		{ path: "/authApp/register", init: null, title:"Register", LogStatus: 0},
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

function OnLogChange()
{
	document.querySelectorAll('.nav__link').forEach(function(button) {
		let match = getRoute(button.href);
		if (match == null || (match.route.LogStatus == 1 && isLog == false))
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
	else if (match.route.LogStatus == 1 && isLog == false)
	{
		match = getRoute(document.location.origin + "/needlog");
	}
	var response = "";
	if (match.route.path == "/")
	{
		response = await fetch(match.route.path + "dashboard");
	}
	else
	{
		response = await fetch(match.route.path);
	}
	
	console.log(match.route.path)
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