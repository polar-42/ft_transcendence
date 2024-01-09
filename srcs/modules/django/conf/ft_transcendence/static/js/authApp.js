import { navto } from "./index.js"

export function initLogin()
{
  const submitBtn =	document.getElementsByClassName("submit_BTN")[0];
  submitBtn.addEventListener("click", connect)
  let inputArray = document.querySelectorAll("input");
  inputArray.forEach((input) => {
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitBtn.click();
      }
    })
  })
  inputArray[1].focus()
}

export function initRegister()
{
  let submitBtn = document.getElementsByClassName("submit_BTN")[0];
  submitBtn.addEventListener("click", register)
  let inputArray = document.querySelectorAll("input");
  inputArray.forEach((input) => {
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitBtn.click();
      }
    })
  })
  inputArray[1].focus()
}

function sleep(ms) {
  let sleepSetTimeout

  clearInterval(sleepSetTimeout)
  return new Promise(resolve => sleepSetTimeout = setTimeout(resolve, ms))
}

export async function logout(event)
{
  event.preventDefault()
  const Response = await fetch(document.location.origin + '/authApp/logout/',
    {
      method: 'GET'
    })
  if (Response.ok)
  {
    var vari = await Response.json()
    if(vari.success == false) {
      return false
    }
    initProfileButton(false)
    return true
  }
  else
    return false
}

export async function checkConnexion()
{
  const Response = await fetch(document.location.origin + '/authApp/check_connexion/',
    {
      method: 'GET'
    })
  if (Response.ok)
  {
    var vari = await Response.json()
    if (vari.connexionStatus == false) {
      return false
    }
    initProfileButton(true)
    return true
  }
  else
    return false
}

async function connect(event)
{
  event.preventDefault()
  var username = document.getElementById('Input_usr').value
  var password = document.getElementById('Input_pwd').value
  const data = { username: username, password: password }
  let feedback = document.querySelector('.feedback')

  const crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value

  var headers = new Headers()
  headers.append('Content-Type', 'application/json')
  headers.append('X-CSRFToken', crsf_token)
  await fetch(document.location.origin + "/authApp/login/",
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })
    .then(Response =>
      {
        if (!Response.ok)
        {
          throw new Error('Network response was not okay')
        }
        return Response.json()
      })
      .then(data =>
        {
          if (data.message)
          {
            feedback.style.color = 'green'
            feedback.innerHTML = data.message
            sleep(3000)
            initProfileButton(true)            
            navto("/")
          }
          else
          {
            feedback.style.color = 'red'
            feedback.innerHTML = data.error
          }
        })
      .catch(error =>
        {
          console.error('Error:', error)
          feedback.innerHTML = data.message
        })
}

function register(event)
{
  event.preventDefault()
  const data = 
    { 
      username: document.getElementById('Input_usr').value,
      email: document.getElementById('Input_mail').value,
      password: document.getElementById('Input_pwd').value,
      passwordConfirmation: document.getElementById('Input_confirm_pwd').value
    }
  console.log(data);

  var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
  let feedback = document.querySelector('.feedback')
  var headers = new Headers()
  headers.append('Content-Type', 'application/json')
  headers.append('X-CSRFToken', crsf_token)

  fetch(document.location.origin + "/authApp/register/",
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })
    .then(Response =>
      {
        if (!Response.ok)
        {
          throw new Error('Network response was not okay')
        }
        return Response.json()
      })
      .then(data =>
        {
          if (data.message)
          {
            feedback.style.color = "green"
            feedback.innerHTML = data.message
            sleep(3000)
            navto("/")
          }
          else
          {
            feedback.style.color = "red"
            feedback.innerHTML = data.error
          }
        })
      .catch(error =>
        {
          console.error('Error:', error)
          feedback.innerHTML = data.message
          return
        })
}

async function initProfileButton (connected) {
  let profiles = document.querySelectorAll(".profile_button")
  if ( connected === true ) {
    let profiles = document.querySelectorAll(".profile_button")
    let Response = await fetch(document.location.origin + '/authApp/getUserName/',
      {
        method: 'GET'
      })
    if (!Response.ok) {
      throw new Error('Error when fetching user datas')
    }
    let userData = await Response.json()
    profiles.forEach((button) => {
      button.classList.add('connected') 
      button.children[2].textContent = userData.userName
    })
  }
  else {
    profiles.forEach((button) => {
      button.classList.remove('connected')
      button.children[2].textContent = 'Log In'
    })
  }
}
