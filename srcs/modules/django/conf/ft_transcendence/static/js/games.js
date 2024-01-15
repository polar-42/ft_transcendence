import { navto } from "./index.js"
import { JoinMatchmaking as PongJoinMatchmaking, LeaveMatchmaking as PongLeaveMatchmaking } from "./pongGameApp.js"
import { JoinMatchmaking as BSJoinMatchmaking, LeaveMatchmaking as BSLeaveMatchmaking } from "./battleshipApp.js"

export function initGames() {
  let checkboxArray = document.querySelectorAll("input[type='checkbox']")
  let spanArray = document.querySelectorAll("label span")

  for (let i = 0; i < checkboxArray.length; i++) {
    checkboxArray[i].addEventListener("click", () => {
      if (checkboxArray[i].checked === true) {
        spanArray[i].classList.add('checked')
        spanArray.forEach((other) => {
          if (other !== spanArray[i]) {
            other.classList.remove('checked')
          }
        })
        checkboxArray.forEach((other) => {
          if (other !== checkboxArray[i]) {
            other.checked = false
          }
        })
      } else {
        spanArray[i].classList.remove('checked')
      }
    })
  }

  let confirmBtn = document.querySelector(".confirm_btn")
  let cancelBtn = document.querySelector(".cancel_btn")

  confirmBtn.addEventListener("click", () => {
    for (let i = 0; i < checkboxArray.length; i++) {
      if (checkboxArray[i].checked === true) {
        if (checkboxArray[i].name === 'local') {
          navto("/pongGame/Local", 'True')
        } else if (checkboxArray[i].name === 'IA') {
          navto("/pongGame/IA", 'True')
        } else if (checkboxArray[i].name === 'online') {
          confirmBtn.classList.add('inqueue')
          cancelBtn.style.display = 'inline-block'
          confirmBtn.textContent = "In queue"
          PongJoinMatchmaking()
          cancelBtn.addEventListener("click", () => {
            confirmBtn.classList.remove('inqueue')
            cancelBtn.style.display = 'none'
            confirmBtn.textContent = "Confirm"
            PongLeaveMatchmaking()
          })
        } else if (checkboxArray[i].name === 'normal') {
          confirmBtn.classList.add('inqueue')
          cancelBtn.style.display = 'inline-block'
          confirmBtn.textContent = "In queue"
          BSJoinMatchmaking()
          cancelBtn.addEventListener("click", () => {
            confirmBtn.classList.remove('inqueue')
            cancelBtn.style.display = 'none'
            confirmBtn.textContent = "Confirm"
            BSLeaveMatchmaking()
          })
        }
      }
    }
  })

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
}
