import Dashboard from "./Views/Dashboard.js";
import Posts from "./Views/Posts.js";
import Settings from "./Views/Settings.js";


const navigateTo = url =>
{
	history.pushState(null, null, url);
	router();
}

const router = async () => 
{
	const routes = [
		{ path: "/", view: Dashboard},
		{ path: "/postslist", view: Posts},
		{ path: "/settings", view: Settings}
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

	document.querySelector("#app").innerHTML = await view.getHtml();
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