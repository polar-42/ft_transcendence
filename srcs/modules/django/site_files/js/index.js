import Dashboard from "./Views/Dashboard.js";
import Battleship from "./Views/Battleship.js";
import PageNotFound from "./Views/PageNotFound.js";

let OldRoute = null;

const navigateTo = url =>
{
	history.pushState(null, null, url);
	router();
}

const router = async () => 
{
	const routes = [
		{ path: "404", view: PageNotFound},
		{ path: "/", view: Dashboard},
		{ path: "/battleship", view: Battleship},
	];
	// Test each routes if one of them match
	const Potentialroutes = routes.map(route => 
		{
			return { 
				route: route,
				isMatch: location.pathname === route.path
			};
		});

	let match = Potentialroutes.find(route => route.isMatch);

	/* define 404 error page */
	if (!match)
	{
		match = {
			route : routes[0],
			isMatch : true
		}
	}

	const view = new match.route.view();
	if (OldRoute != null)
		OldRoute.unLoad();
	OldRoute = view;
	document.querySelector("#app").innerHTML = await view.getHtml();
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