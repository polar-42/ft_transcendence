import { navto } from "./index.js"
import { JoinMatchmaking as PongJoinMatchmaking, LeaveMatchmaking as PongLeaveMatchmaking } from "./pongGameApp.js"
import { JoinMatchmaking as BSJoinMatchmaking, LeaveMatchmaking as BSLeaveMatchmaking } from "./battleshipApp.js"

export function initGames() {
  let checkboxArray = document.querySelectorAll("input[type='checkbox']")
  let spanArray = document.querySelectorAll("label span")
  let labelArray = document.querySelectorAll(".selection_wrapper li")
  let PongConfirmBtn = document.querySelector(".pong .confirm_btn")
  let BSConfirmBtn = document.querySelector(".battleship .confirm_btn")
  let PongCancelBtn = document.querySelector(".pong .cancel_btn")
  let BSCancelBtn = document.querySelector(".battleship .cancel_btn")

  for (let i = 0; i < labelArray.length; i++) {
    labelArray[i].addEventListener("click", labelOnClick)
  }

  PongConfirmBtn.addEventListener("click", PongConfirmBtnClick)
  BSConfirmBtn.addEventListener("click", BSConfirmBtnClick)

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

  function PongConfirmBtnClick() {
    for (let i = 0; i < checkboxArray.length; i++) {
      if (checkboxArray[i].checked === true) {
        if (checkboxArray[i].name === 'local') {
          navto("/pongGame/Local", 'True')
        } else if (checkboxArray[i].name === 'IA') {
          navto("/pongGame/IA", 'True')
        } else if (checkboxArray[i].name === 'online') {
          PongToggleQueue()
        } 
      }
    }
  }

  function BSConfirmBtnClick() {
    for (let i = 0; i < checkboxArray.length; i++) {
      if (checkboxArray[i].checked === true && checkboxArray[i].name === 'normal') {
        BSToggleQueue()  
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

  function PongToggleQueue() {
    PongConfirmBtn.classList.add('inqueue')
    PongConfirmBtn.parentElement.parentElement.parentElement.classList.add('inqueue')
    PongCancelBtn.style.display = 'inline-block'
    PongConfirmBtn.textContent = "In queue"
    for (let i = 0; i < checkboxArray.length; i++) {
      labelArray[i].removeEventListener("click", labelOnClick)
    }
    PongCancelBtn.addEventListener("click", () => {
      PongLeaveQueue()
    }) 
    PongJoinMatchmaking()
  }

  function BSToggleQueue() {
    BSConfirmBtn.classList.add('inqueue')
    BSConfirmBtn.parentElement.parentElement.parentElement.classList.add('inqueue')
    BSCancelBtn.style.display = 'inline-block'
    BSConfirmBtn.textContent = "In queue"
    for (let i = 0; i < checkboxArray.length; i++) {
      labelArray[i].removeEventListener("click", labelOnClick)
    }
    BSCancelBtn.addEventListener("click", () => {
      BSLeaveQueue()
    }) 
    BSJoinMatchmaking()
  }

  function PongLeaveQueue() {
    PongConfirmBtn.classList.remove('inqueue')
    PongConfirmBtn.parentElement.parentElement.parentElement.classList.remove('inqueue')
    PongCancelBtn.style.display = 'none'
    PongConfirmBtn.textContent = "Confirm"
    for( let i = 0; i < labelArray.length; i++) {
      labelArray[i].addEventListener("click", labelOnClick)
    }
    PongLeaveMatchmaking()
  }

  function BSLeaveQueue() {
    BSConfirmBtn.classList.remove('inqueue')
    BSConfirmBtn.parentElement.parentElement.parentElement.classList.remove('inqueue')
    BSCancelBtn.style.display = 'none'
    BSConfirmBtn.textContent = "Confirm"
    for( let i = 0; i < labelArray.length; i++) {
      labelArray[i].addEventListener("click", labelOnClick)
    }
    BSLeaveMatchmaking()
  }
}
