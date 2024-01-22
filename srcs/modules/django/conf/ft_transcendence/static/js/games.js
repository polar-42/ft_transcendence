import { navto } from "./index.js"
import { JoinMatchmaking as PongJoinMatchmaking, LeaveMatchmaking as PongLeaveMatchmaking } from "./pongGameApp.js"
import { JoinMatchmaking as BSJoinMatchmaking, LeaveMatchmaking as BSLeaveMatchmaking } from "./battleshipApp.js"

export function initGames() {
  let checkboxArray = document.querySelectorAll("input[type='checkbox']")
  let spanArray = document.querySelectorAll("label span")
  let labelArray = document.querySelectorAll(".selection_wrapper li")
  let confirmBtn = document.querySelector(".confirm_btn")
  let cancelBtn = document.querySelector(".cancel_btn")

  for (let i = 0; i < labelArray.length; i++) {
    labelArray[i].addEventListener("click", labelOnClick)
  }

  confirmBtn.addEventListener("click", confirmBtnClick)

  let tournamentBtnArray = document.querySelectorAll(".tournament_btn button")
  tournamentBtnArray.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.name === "create_tournament") {
        navto("/tournaments/Create", "True")
      } else if (button.name === "join_tournament") {
        navto("/tournaments/Join", "True")
      }
    })
  })

  function confirmBtnClick() {
    for (let i = 0; i < checkboxArray.length; i++) {
      if (checkboxArray[i].checked === true) {
        if (checkboxArray[i].name === 'local') {
          navto("/pongGame/Local", 'True')
        } else if (checkboxArray[i].name === 'AI') {
          navto("/pongGame/IA", 'True')
        } else if (checkboxArray[i].name === 'online') {
          toggleQueue("pong")
        } else if (checkboxArray[i].name === 'normal') {
          toggleQueue("battleship")
        }
      }
    }
  }

  function labelOnClick() {
    let checkbox = this.children[0].children[0]
    let span =  this.children[0].children[1]
    if (checkbox.checked === false ) {
      checkbox.checked = true
      span.classList.add('checked')
      checkboxArray.forEach((other) => {
        if (other !== checkbox) {
          other.checked = false
        }
      })
      spanArray.forEach((other) => {
        if (other !== span) {
          other.classList.remove('checked')
        }
      })
    } else {
      checkbox.checked = false
      span.classList.remove('checked')
    }
  }

  function toggleQueue(type) {
    confirmBtn.classList.add('inqueue')
    cancelBtn.style.display = 'inline-block'
    confirmBtn.textContent = "In queue"
    for (let i = 0; i < checkboxArray.length; i++) {
      labelArray[i].removeEventListener("click", labelOnClick)
    }
    cancelBtn.addEventListener("click", () => {
      leaveQueue(type)
    })
    if (type === 'pong') {
      document.querySelector(".pong").classList.add("inqueue")
      PongJoinMatchmaking()
    } else {
      document.querySelector(".battleship").classList.add("inqueue")
      BSJoinMatchmaking();
    }
  }

  function leaveQueue(type) {
    confirmBtn.classList.remove('inqueue')
    cancelBtn.style.display = 'none'
    confirmBtn.textContent = "Confirm"
    for( let i = 0; i < labelArray.length; i++) {
      labelArray[i].addEventListener("click", labelOnClick)
    }
    if (type === 'pong') {
      document.querySelector(".pong").classList.remove("inqueue")
      PongLeaveMatchmaking()
    } else {
      document.querySelector(".battleship").classList.remove("inqueue")
      BSLeaveMatchmaking();
    }
  }
}
