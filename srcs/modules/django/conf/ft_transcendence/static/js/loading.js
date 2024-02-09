onload = (event) => {
	if(document.querySelector("#app") == null)
	{
		var actualRoute = document.location.origin + window.location.pathname + window.location.search
		if (actualRoute.includes('/?') == false)
			actualRoute += '/?Valid=false'
		else if (actualRoute.endsWith('/') == true)
			actualRoute += '?Valid=false'
		else if (actualRoute.includes('Valid=') == false)
			actualRoute += '&Valid=false'
		window.location.replace(actualRoute)
	}
}
