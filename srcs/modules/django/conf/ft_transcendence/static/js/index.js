import { checkConnexion, initLogin, initRegister, logout } from "./authApp.js"
import { initGames } from "./games.js"
import { exitPongLocal, initLocalGamePong } from "./pongGameLocal.js"
import { initGamePongIA, unloadGamePongIA } from './pongGameIA.js'
import { initDashboard } from "./dashboardApp/dashboard.js"
import { initHomePage} from "./homepage.js"
import { CP_Unload, initGame } from "./BattleshipGame.js"
import { initGamePong, unLoadGamePong } from "./pongGameRemote.js"
import { initTournamentsCreation } from "./tournaments/tournamentsCreation.js"
import { initTournamentsJoinPage } from "./tournaments/tournamentsJoinPage.js"
import { GoingAway, initTournaments } from "./tournaments/tournament.js"
import { initChat, unsetChatbox } from "./chatApp/CA_General.js"
import { initTournamentView } from "./tournaments/tournamentSpectate.js"
import { initUpdateAccount } from "./userManagement/userManagement.js"
import { initProfile } from "./userProfileApp/profile.js"
import { initNeedLogPage } from "./needlog.js"

export function navto(urlpath)
{
  history.pushState(null, null, urlpath)
  router()
}

const navigateTo = url =>
{
  history.pushState(null, null, url)
  router(null)
}

initChat();

function getRoute(RoutePath)
{
  const routes = [

    { path: "/", init: initHomePage, unload: null, title:"Home", LogStatus: 2},
    { path: "/404", init: null, unload: null, title:"404", LogStatus: 2},
    { path: "/needlog", init: initNeedLogPage, unload: null, title:"Login required", LogStatus: 0},
    { path: "/dashboard", init: initDashboard, unload: null, title:"Home", LogStatus: 1},
    { path: "/games", init: initGames, unload: null, title:"Games", LogStatus: 1},
    { path: "/battleship/", init: initGame, unload: CP_Unload, title:"Battleship", LogStatus: 1},
    { path: "/pongGame/Remote/", init: initGamePong, unload: unLoadGamePong, title:"pongGame", LogStatus: 1},
    { path: "/pongGame/Local", init: initLocalGamePong, unload: exitPongLocal, title:"pongGame", LogStatus: 1},
    { path: "/pongGame/IA", init: initGamePongIA, unload: unloadGamePongIA, title:"pongGame", LogStatus: 1},
    { path: "/tournaments/Create", init: initTournamentsCreation, unload: null, title:"initTournaments", LogStatus: 1},
    { path: "/tournaments/Join", init: initTournamentsJoinPage, unload: null, title:"Join Tournaments", LogStatus: 1},
    { path: "/tournaments/Play/", init: initTournaments, unload: GoingAway, title:"Tournament", LogStatus: 1},
    { path: "/tournaments/View/", init: initTournamentView, unload: null, title:"Tournament", LogStatus: 1},
    { path: "/authApp/login", init: initLogin, unload: null, title:"Login", LogStatus: 0},
    { path: "/authApp/register", init: initRegister, unload: null, title:"Register", LogStatus: 0},
    { path: "/userManagement", init: initUpdateAccount, unload: null, title:"userManagement", LogStatus: 1},
    { path: "/profile/", init: initProfile, unload: exitPongLocal, title:"profile", LogStatus: 1},
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

async function OnLogChange()
{
  var logStatus = await checkConnexion()
  document.querySelectorAll('.nav__link').forEach(function(button) {
    let match = getRoute(button.href)
    if (match == null || (match.route.LogStatus == 1 && logStatus == false) || match.route.LogStatus == 0 && logStatus == true)
      button.style.display = "none"
    else
      button.style.display = "block"
  })
}

let Prev_match = undefined

const router = async () =>
{
	let match = getRoute(document.location.origin + location.pathname)
	/* define 404 error page */
	if (!match)
	{
		match = getRoute(document.location.origin + "/404")
	}
	else if (match.route.LogStatus == 1 && await checkConnexion() == false)
	{
		// console.log('hello')
		match = getRoute(document.location.origin + "/needlog")
	}
	else if (match.route.LogStatus == 0 && await checkConnexion() == true)
		match = getRoute(document.location.origin + "/")
	var actualRoute
	if (match.route.path == "/")
		actualRoute = match.route.path + "homepage"
	else if (match.route.path.endsWith('/needlog') == false && match.route.path.endsWith('/404') == false)
		actualRoute = document.location.origin + window.location.pathname + window.location.search
	else
		actualRoute = match.route.path
	if (Prev_match != undefined && Prev_match.route.unload != null)
		Prev_match.route.unload()
	// console.log(actualRoute)
	if (actualRoute.includes('/?') == false)
		actualRoute += '/?Valid=true'
	else if (actualRoute.endsWith('/') == true)
		actualRoute += '?Valid=true'
	else if (actualRoute.includes('Valid=') == false)
		actualRoute += '&Valid=true'
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
			match.route.init()
		Prev_match = match
		// OnLogChange()
	})
  .catch(

  )
}

const menuBtn = document.querySelector(".menu_btn")
const dropDownMenu = document.querySelector(".dropdown_menu")

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

function clickLogout(e) {
  let profileDropDowns = document.querySelectorAll(".profile_menu");
  profileDropDowns.forEach((menu) => menu.classList.remove("active"));
  dropDownMenu.classList.remove('open')
  menuBtn.src = '/static/assets/logo/hamburger.png'
  unsetChatbox()
  logout(e);
  navto("/");
}

document.querySelectorAll("button[name='logout']").forEach((logout) =>
  logout.addEventListener("click", clickLogout)
)


menuBtn.addEventListener("click", () => {
  dropDownMenu.classList.toggle('open')
  const isOpen = dropDownMenu.classList.contains('open')

  menuBtn.src = isOpen ? '/static/assets/logo/cross.png' : '/static/assets/logo/hamburger.png';
});

const menuLink = document.querySelectorAll(".menu_link");
for (let link of menuLink) {
  link.addEventListener("click", () => {
    dropDownMenu.classList.remove('open');
    menuBtn.src = '/static/assets/logo/hamburger.png';
  });
}

const profileButton = document.querySelectorAll(".profile_button");
const profileDropDown  = document.querySelectorAll(".profile_menu");

for (let i = 0; i < 2; i++)
{
  profileButton[i].addEventListener("click", async () => {
    let isOpen = profileDropDown[i].classList.contains('active');
    let logStatus = await checkConnexion();
    if (logStatus == true)
    {
      if (isOpen) {
        profileDropDown[i].classList.remove('active');
      } else {
        profileDropDown[i].classList.add('active');
        profileDropDown[i].style.width = profileButton[i].clientWidth.toString() + "px"
      }
    }
    else
    {
      dropDownMenu.classList.toggle('active')
      menuBtn.src = '/static/assets/logo/hamburger.png'
      navto("/authApp/login");
    }
  })
}

document.addEventListener("click", (event) => {
  if (!dropDownMenu.contains(event.target) && !menuBtn.contains(event.target)) {
    dropDownMenu.classList.remove('active');
    menuBtn.src="/static/assets/logo/hamburger.png";
  };
  for (let menu of profileDropDown) {
    if (!menu.contains(event.target)) {
      menu.classList.remove("active");
    }
  }
})
