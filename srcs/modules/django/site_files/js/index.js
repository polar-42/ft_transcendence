import Dashboard from "./Views/Dashboard.js";
import Battleship from "./Views/Battleship.js";
import PageNotFound from "./Views/404.js";
import NeedLog from "./Views/NeedLog.js";
import register from "./Views/authApp/register.js";
import login from "./Views/authApp/login.js";

let OldRoute = null;

let isLog = false;

const navigateTo = url =>
{
	history.pushState(null, null, url);
	router();
}

function getRoute(RoutePath)
{
	const routes = [
		{ path: "/404", view: PageNotFound, LogStatus: 2},
		{ path: "/needlog", view: NeedLog, LogStatus: 0},
		{ path: "/", view: Dashboard, LogStatus: 2},
		{ path: "/battleship", view: Battleship, LogStatus: 1},
		{ path: "/authApp/login", view: login, LogStatus: 0},
		{ path: "/authApp/register", view: register, LogStatus: 0},
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
	const view = new match.route.view();
	if (OldRoute != null)
	{
		OldRoute.unLoad();
	}
	OldRoute = view;
	document.querySelector("#app").innerHTML = await view.getHtml(match.route.path);
    var oldScript = document.querySelector("#ViewScript")
	var script = await view.getJs()
	if (script != "")
	{
		var newScript = document.createElement('script');
		newScript.type = 'module';
		newScript.id = 'ViewScript';
		newScript.src = script;
		if (oldScript != null)
			oldScript.parentNode.replaceChild(newScript, oldScript);
		else
			document.body.appendChild(newScript);
	}
	else if (oldScript != null)
	{
		document.body.removeChild(oldScript);
	}
	OnLogChange();
	view.Load();
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