onload = (event) => {
	if(document.querySelector("#app") == null)
	{
		// console.log(window.location.origin + window.location.pathname)
		// window.history.replaceState(null, null, window.location.origin + window.location.pathname)
		window.location.replace(window.location.origin + window.location.pathname + '/?Erroneus=True')
	}
}
// 		console.log(pathname)
// 		// const pathname = window.location.pathname
// 		// window.history.replaceState(null, null, window.location.origin)
// 		// fetch (window.location.origin)
// 		// .then(Response => {
// 			// document.title = "Home"
// 			// return Response.text()
// 		// })
// 		// .then(html => {
// 			// document.innerHTML = html
// 			// console.log(document.innerHTML)
// 		// })
// 		// .then(Response => {
// 			// navto(pathname)
// 		// })
// 		// .catch(value => {
// 			// window.location.replace(window.location.origin)
// 		// })
// 	}
// }

// setTimeout(() => {
	// if(document.querySelector("#app") == null)
	// {
		// const pathname = window.location.pathname
		// window.history.replaceState(null, null, window.location.origin)
		// fetch (window.location.origin)
		// .then(Response => {
			// document.title = "Home"
			// return Response.text()
		// })
		// .then(html => {
			// document.innerHTML = html
			// console.log(document.innerHTML)
		// })
		// .then(Response => {
		// 	navto(pathname)
		// })
		// .catch(value => {
		// 	window.location.replace(window.location.origin)
		// })
	// }	
// }, 1000);
