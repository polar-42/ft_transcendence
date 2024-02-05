// import { convertArray } from "three/src/animation/AnimationUtils.js";
import { checkConnexion } from "./authApp.js";
import { navto } from "./index.js";


let chatHeader = document.querySelector(".chatbox_header_wrapper");
let chatSocket = undefined;

export async function initChat()
{
  let logStatus = await checkConnexion();
  if (logStatus == true && chatSocket == undefined)
  {
    chatHeader.classList.add('connected')
    chatHeader.addEventListener("click", openChatbox)
    startChatConnexion();
  }
}

function openChatbox() {
  document.querySelector(".chatbox_wrapper").classList.add("open")
  chatHeader.removeEventListener("click", openChatbox)
  chatHeader.addEventListener("click", closeChatbox)
}

export function closeChatbox() {
  document.querySelector(".chatbox_wrapper").classList.remove("open")
  chatHeader.removeEventListener("click", closeChatbox)
  chatHeader.addEventListener("click", openChatbox)
}

function initChatHomepage() {
  initHomepageHeader()
  initHomepageBody()
}

function initHomepageHeader() {
  let mainBoxHeader = document.querySelector(".main_box_header")
  mainBoxHeader.classList.add("homepage")
  let html =
    '<img src="../static/assets/logo/search-regular-24.png" alt="search icon">' +
    '<input type="text" name"searchbar">'
  mainBoxHeader.innerHTML = html
  mainBoxHeader.children[1].addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
      searchConv()
    }
  })
}

function searchConv() {
  let search = document.querySelector(".main_box_header input").value
  chatSocket.send(JSON.stringify({
    'type': 'search_conv',
    'input': search
  }))
}

function initHomepageBody() {
  let mainBoxBody = document.querySelector(".main_box_body")
  mainBoxBody.classList.add("homepage")

  let html = '<h2>Discussions</h2>' +
    '<ul class="conversation_list"></ul>' +
    '<div class="chatbox_homepage_navbar">' +
    '<button name="discussions">Discussions</button>' +
    '<button name="friends">Friends</button>' +
    '<button name="create_channel">Create a channel</button>' +
    '</div>'
  mainBoxBody.innerHTML = html

  document.querySelector("button[name='create_channel']").addEventListener("click", initCreateChannel)
  getLastChats()
}

export function unsetChatbox() {
  closeChatbox()
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")
  chatHeader.classList.remove("connected")
  mainBoxBody.classList.forEach((className) => {
    if (className !== "main_box_body") {
      mainBoxBody.classList.remove(className)
    }
  })
  mainBoxHeader.classList.forEach((className) => {
    if (className !== "main_box_header") {
      mainBoxHeader.classList.remove(className)
    }
  })
  while (mainBoxBody.children.length > 0) {
    mainBoxBody.children[0].remove()
  }
  while (mainBoxHeader.children.length > 0) {
    mainBoxHeader.children[0].remove()
  }
}


export function closeChat()
{
	if (chatSocket != undefined)
	{
		if (chatSocket.readyState === chatSocket.OPEN)
		{
			console.log('close')
			chatSocket.close();
			chatSocket = undefined
		}
	}
}

function startChatConnexion()
{
  chatSocket = new WebSocket("ws://" + window.location.host + '/chat/');

  chatSocket.onopen = initChatHomepage
  chatSocket.onclose = closeChatSocket;
  chatSocket.onmessage = e => onMessageChat(e);
  chatSocket.onclose = closeChatSocket;
  chatSocket.onmessage = e => onMessageChat(e);
}

function closeChatSocket()
{
  chatSocket = undefined;
}

function onMessageChat(e)
{
  const data = JSON.parse(e.data)

  console.log(data)
  switch (data['type']) {
    case 'search_conv':
      displaySearchResult(data.data)
      break
    case 'last_chats':
      displayLastChats(data.data)
      break
    case 'get_user_data':
      displayPrivMsg(data)
      break
    case 'get_channel_data':
      displayChannel(data)
      break
    case 'chat_history':
      displayChatHistory(data.data)
      break
    case 'actualize_chat_history':
      actualizeChatHistory(data.data)
      break
    case 'actualize_channel_history':
      actualizeChannelHistory(data.data)
      break
    case 'channel_history':
      displayChannelHistory(data.data)
      break
    case 'channel_creation':
      receiveChanCreation(data)
      break
    case 'chat_private_message':
      receiveMsg(data)
      break
    case 'chat_channel_message':
      receiveChanMsg(data)
      break
    case 'join_channel_response':
      receiveJoinChanResponse(data)
      break
    case 'edit_description':
      receiveDescriptionEdit(data)
      break
      //      console.log(data);
      // if (data.type == 'receive_invitation_pong')
      // {
      // 	receivePongInvitation(data)
      // }
      // if (data.type == 'receive_invitation_battleship')
      // {
      // 	receiveBattleshipInvitation(data)
      // }
      // else if (data.type == 'start_pong_game')
      // {
      // 	startPongGame(data)
      // }
      // else if (data.type == 'start_battleship_game')
      // {
      // 	startBattleshipGame(data)
      // }
  }
}

function displayLastChats(data) {
  let conversation_list = document.querySelector(".conversation_list")
  for (let i = data.length - 1; i >= 0; i--) {
    console.log(data[i])
    let lastMsg
    if (data[i].last_msg.msg !== '')
      lastMsg = data[i].last_msg.sender + ': ' + data[i].last_msg.msg
    else
      lastMsg = ''
    let isConnected
    if (data[i].connexionStatus === undefined)
      isConnected = ''
    else if (data[i].connexionStatus === 0)
      isConnected = 'disconnected'
    else
      isConnected = 'connected'
    let item =
      '<li class="' + data[i].type + '">' +
      '<img src="../static/assets/logo/user.png" alt="converstion_picture">' +
      '<div class="conversation_text">' +
      '<div class="conversation_name">' +
      '<p>' + data[i].name + '</p>' +
      '<div class="connection_point ' + isConnected + '"></div>' +
      '</div>' +
      '<p class="last_msg">' + lastMsg + '</p>' +
      '</div>' +
      '</li>'

    if (conversation_list.children.length > 0)
      conversation_list.firstChild.insertAdjacentHTML("beforebegin", item)
    else
      conversation_list.innerHTML = item
    conversation_list.firstChild.addEventListener("click", () => {
      if (data[i].type === 'private')
        goToConv(data[i].id)
      else
        goToChan(data[i].name)
    })
  }
}

function displaySearchResult(data) {
  let resultWrapper = document.querySelector(".conversation_list")
  if (document.querySelector(".main_box_header").children.length === 2)
    document.querySelector(".main_box_header").insertAdjacentHTML("beforeend", '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return back button" class="back_arrow">')
  document.querySelector(".main_box_header img.back_arrow").addEventListener("click", () => {
    cleanMainBox()
    initChatHomepage()
  })

  while (resultWrapper.children.length > 0) {
    resultWrapper.removeChild(resultWrapper.children[0])
  }

  let isConnected
  let member

  for (let i = 0; i < data.length; i++) {
    console.log(data[i])
    if (data[i].connexion_status == 2) {
      isConnected = 'connected'
    } else if (data[i].connexion_status === 0) {
      isConnected = 'disconnected'
    } else {
      isConnected = ''
    }
    if (data[i].member === false) {
      member = 'not_member'
    } else {
      member = ''
    }
    let privacyStatus = ''
    if (data[i].privacy_status !== undefined)
      privacyStatus = 'privacyStatus="' + data[i].privacy_status +'"'
    let isNoticationActive = ''
    let lastMsg
    if (data[i].type === 'channel')
      lastMsg = data[i].description
    else if (data[i].last_msg.message === undefined)
      lastMsg = ''
    else
      lastMsg = data[i].last_msg.sender + ': ' + data[i].last_msg.message
    let item =
      '<li class="' + data[i].type + ' ' + member + '" ' + privacyStatus +'>' +
      '<img src="../static/assets/logo/user.png" alt="converstion_picture">' +
      '<div class="conversation_text">' +
      '<div class="conversation_name">' +
      '<p>' + data[i].name + '</p>' +
      '<div class="connection_point ' + isConnected + '"></div>' +
      '</div>' +
      '<p class="last_msg">' + lastMsg + '</p>' +
      '</div>' +
      '<div class="notification_wrapper ' + isNoticationActive + '"></div>' +
      '<img class="join_btn" src="../static/assets/logo/user-plus-regular-36.png" alt="join channel button">' +
      '</li>'
    if (resultWrapper.children.length > 0) {
      resultWrapper.lastChild.insertAdjacentHTML("afterend", item)
    } else {
      resultWrapper.innerHTML = item
    }
    resultWrapper.lastChild.addEventListener("click", () => {
      if (data[i].type === 'private_message') {
        goToConv(data[i].identification)
      } else if (data[i].type === 'channel' && data[i].member === true) {
        goToChan(data[i].name)
      }
    })
    resultWrapper.lastChild.querySelector(".join_btn").addEventListener("click", clickJoinChan)
  }
}

function clickJoinChan(event) {
  let item = event.target.parentElement
  let channelName = item.querySelector(".conversation_name p").textContent
  let privacyStatus = item.getAttribute("privacyStatus")

  if (privacyStatus === '0') {
    joinChannel(channelName, false, '')
    return
  }
  let previousHtml = item.innerHTML
  let html =
    '<div class="join_channel_box">' +
    '<div class="join_pwd_wrapper">' +
    '<label for="channel_password">Enter Channel Password</label>' +
    '<div class="join_input_wrapper">' +
    '<input name="channel_password" type="password" placeholder="Enter channel password">' +
    '<img src="../static/assets/logo/send-solid-60.png" name="send arrow">'  +
    '</div>' +
    '<p class="feedback"></p>' +
    '</div>' +
    '<img src="../static/assets/logo/arrow-back-regular-60.png" name="back arrow">'  +
    '</div>'

  item.innerHTML = html
  item.querySelector("input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      joinChannel(channelName,  true, item.querySelector("input").value)
    }
  })
  item.querySelector("img[name='send arrow']").addEventListener("click", () => {
    joinChannel(channelName,  true, item.querySelector("input").value)
  })
  item.querySelector("img[name='back arrow']").addEventListener("click", () => {
    item.innerHTML = previousHtml
    item.querySelector(".join_btn").addEventListener("click", clickJoinChan)
  })
}

function displayChatHistory(data) {
  let conversation = document.querySelector(".conversation")
  for (let i = 0 ; i < data.length; i++) {
    let sender
    if (data[i].received === true) {
      sender = ''
    } else {
      sender = 'own'
    }

    let item =
      '<li class="message_item ' + sender + '" msgid=' + data[i].id + '>' +
      '<p class="message">' + data[i].message + '</p>' +
      '<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
      '</li>'
    if (conversation.children.length === 0) {
      conversation.innerHTML = item
    } else {
      conversation.firstChild.insertAdjacentHTML("beforebegin", item)
    }
  }
  conversation.scrollTo(0, conversation.scrollHeight)
}

function displayChannel(data) {
  initChanHeader(data)
  initChanBody(data)

  function initChanHeader(data) {
    let general
    if (data.name === 'General')
      general = 'general'
    else
      general = ''
    let html =
      '<div class="contact_wrapper ' + general + ' ">' +
      '<img src="../static/assets/logo/user.png" alt="channel picture">' +
      '<div class="contact_name_wrapper">' +
      '<p class="channel_name">' + data.name + '</p>' +
      '<div class="description_wrapper">' +
      '<p class="channel_description">' + data.description + '</p>' +
      '<img class="edit_description" src="../static/assets/logo/edit-regular-36.png" alt="leave channel button">' +
      '</div>' +
      '</div>' +
      '<img class="leave_channel" src="../static/assets/logo/red_cross.png" alt="leave channel button">' +
      '</div>' +
      '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'


    document.querySelector(".main_box_header").innerHTML = html
    document.querySelector(".main_box_header").children[1].addEventListener("click", () => {
      document.querySelector(".main_box_header").classList.remove("channel")
      document.querySelector(".main_box_body").classList.remove("channel")
      cleanMainBox()
      initChatHomepage()
    })
    document.querySelector(".leave_channel").addEventListener("click", () => {
      leaveChannel(data.name)
    })
    document.querySelector(".edit_description").addEventListener("click", initEditDescription)
    if (data.admin === false)
      document.querySelector(".edit_description").style.display = 'none'

    function initEditDescription() {
      let box =
        '<div class="edit_description_box">' +
        '<div class="edit_main_wrapper">' +
        '<label for="description">New description</label>' +
        '<div class="input_wrapper">' +
        '<input name="description" type="text" placeholder="Enter new description">' +
        '<img src="../static/assets/logo/send-solid-60.png" alt="send arrow">' +
        '</div>' +
        '</div>' +
        '<img class="back_arrow" src="../static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'
      '</div>'
      document.querySelector(".main_box_header.channel").insertAdjacentHTML("afterend", box)
      document.querySelector(".back_arrow").addEventListener("click", () => {
        document.querySelector(".edit_description_box").remove()
      })

      document.querySelector(".edit_description_box .input_wrapper input").addEventListener("keypress", (e) => {
        if (e.key === "Enter")
          editChanDescription()
      })
      document.querySelector(".edit_description_box .input_wrapper img").addEventListener("click", editChanDescription())
      document.querySelector(".edit_description_box .input_wrapper input").focus()
    }

    function editChanDescription() {
      let description = document.querySelector(".edit_description_box .input_wrapper input").value
      if (description === '')
        return
      let channelName =  document.querySelector(".main_box_header.channel .channel_name").textContent

      chatSocket.send(JSON.stringify({
        'type': 'edit_description',
        'channel_name': channelName,
        'description': description
      })
      )
    }
  }



  function initChanBody(data) {
    let html =
      '<div class="conversation_body">' +
      '<div class="sidebar"></div>' +
      '<div class="conversation"></div>' +
      '</div>' +
      '<div class="sendbox">' +
      '<input type="text" placeholder="Enter your message">' +
      '<img src="../static/assets/logo/send-solid-60.png" alt="send arrow">' +
      '</div>'

    document.querySelector(".main_box_body").innerHTML = html
    let conversation = document.querySelector(".conversation")
    let sendbox = document.querySelector(".sendbox")
    sendbox.children[0].addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        channelMessage(sendbox.children[0].value, data.name)
        sendbox.children[0].value = ""
      }
    })
    sendbox.children[1].addEventListener("click", () => {
      channelMessage(sendbox.children[0].textContent, data.name)
      sendbox.children[0].value = ""
    })

    var lastScrollTop = 0
    conversation.addEventListener("scroll", () => {
      let st = conversation.scrollTop

      if (st <= (lastScrollTop * 0.1)) {
        chanOnTopScroll(data.name)
      }
      lastScrollTop = st
    })


    loadChanUser(data)

    chatSocket.send(JSON.stringify({
      'type': 'get_history_channel',
      'target': data.name,
      'msgId': -1
    }))

    function loadChanUser(data) {
      let users = data['users']
      let sidebar = document.querySelector(".sidebar")
      for (let i = 0; i < users.length; i++) {
        let isConnected
        if (users[i].connexion_status === 2) {
          isConnected = 'connected'
        } else if (users[i].connexion_status === 0) {
          isConnected = 'disconnected'
        } else {
          isConnected = ''
        }

        if (users[i] !== self.username) {
          let item =
            '<div class="user_wrapper">' +
            '<div class="connection_point ' + isConnected + '"></div>' +
            '<img src="../static/assets/logo/user.png" alt="channel member profile picture">' +
            '<p class="username">' + users[i].name + '</p>' +
            '<img class="kick_cross" src="../static/assets/logo/red_cross.png" alt="kick user button">' +
            '</div>'

          if (sidebar.children.length > 0) {
            sidebar.lastChild.insertAdjacentHTML("afterend", item)
          } else {
            sidebar.innerHTML = item
          }
          let kick = sidebar.lastChild.querySelector(".kick_cross")
          if (data.admin === false)
            kick.style.display = 'none'
          else
            kick.addEventListener("click", () => {
              kickUser(data.name, users[i].id)
            })
        }
      }
    }
  }
}

async function displayChannelHistory(data) {
  let conversation = document.querySelector(".conversation")
  let Response = await fetch(document.location.origin + '/authApp/getUserID',
    {
      method: 'GET'
    })
  if (!Response.ok) {
    throw new Error('Error when fetching user datas')
  }
  let userData = await Response.json()
  console.log(userData)

  for (let i =  data.length - 1; i >= 0; i--) {

    let sender
    let received
    if (data[i].senderID === userData.userID) {
      received = "own"
      sender =  ''
    } else {
      received = ""
      sender = data[i].sender
    }

    let item =
      '<li class="message_item ' + received + '" msgId="' + data[i].id + '">' +
      '<div class="sender">' +
      '<img src="../static/assets/logo/user.png" alt="sender profile picture">' +
      '<p>' + sender + '</p>' +
      '</div>' +
      '<div class="message_wrapper">' +
      '<p class="message">' + data[i].message + '</p>' +
      '<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
      '</div>' +
      '</li>'

    if (conversation.children.length === 0) {
      conversation.innerHTML = item
    } else {
      conversation.lastChild.insertAdjacentHTML("afterend", item)
    }
  }
  conversation.scrollTo(0, conversation.scrollHeight)
}

function goToConv(id) {
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")
  cleanMainBox()
  mainBoxBody.classList.add("private_message")
  mainBoxHeader.classList.add("private_message")
  chatSocket.send(JSON.stringify({
    'type': 'get_user',
    'target': id
  }))
}

function goToChan(name) {
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")
  cleanMainBox()
  mainBoxBody.classList.add("channel")
  mainBoxHeader.classList.add("channel")
  chatSocket.send(JSON.stringify({
    'type': 'get_channel',
    'target': name,
    'msgId': -1
  }))
}

function cleanMainBox() {
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")

  while (mainBoxBody.children.length > 0) {
    mainBoxBody.removeChild(mainBoxBody.children[0])
  }
  while (mainBoxHeader.children.length > 0) {
    mainBoxHeader.removeChild(mainBoxHeader.children[0])
  }
  mainBoxBody.classList.remove("homepage")
  mainBoxHeader.classList.remove("homepage")
}

function startPongGame(data)
{
  navto("/pongGame/Remote", data.gameId);
}

function startBattleshipGame(data)
{
  navto("/battleship", data.gameId)
}

function receivePongInvitation(data)
{
  if (confirm('Your received an invitation to pong game by ' + data.sender))
  {
    console.log('lets go');
    chatSocket.send(JSON.stringify({
      'type': 'accept_invitation_pong',
      'target': data.sender
    }))
  }
  else
  {
    console.log('pas go');
  }
}

function receiveBattleshipInvitation(data)
{
  if (confirm('Your received an invitation to battleship game by ' + data.sender))
  {
    console.log('lets go');
    chatSocket.send(JSON.stringify({
      'type': 'accept_invitation_battleship',
      'target': data.sender
    }))
  }
  else
  {
    console.log('pas go');
  }
}

function sendMessage(message, targetUser)
{
  console.log('message is', message, 'and tagetUser is', targetUser);

  let conversation = document.querySelector(".conversation")
  let date = new Date()
  let datevalues = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ]
  let timestamp = `${datevalues[0]}-${datevalues[1]}-${datevalues[2]} ${datevalues[3]}:${datevalues[4]}:${datevalues[5]}`
  let html =
    '<li class="message_item own">' +
    '<p class="message">' + message + '</p>' +
    '<p class="timestamp">' + timestamp + '</p>' +
    '</li>'
  if (conversation.children.length > 0) {
    conversation.lastChild.insertAdjacentHTML('afterend', html)
  } else {
    conversation.innerHTML = html
  }
  conversation.scrollTo(0, conversation.scrollHeight)
  chatSocket.send(JSON.stringify({
    'type': 'chat_message',
    'message': message,
    'target': targetUser
  }))
}

function channelMessage(message, targetChannel)
{
  chatSocket.send(JSON.stringify({
    'type': 'channel_message',
    'target': targetChannel,
    'message': message
  }))
}

function inviteToPongGame()
{
  let channelName = document.getElementById('target_user');

  if (channelName.value.length <= 3)
  {
    console.log('Error: One field too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'invite_pong',
    'target': channelName.value
  }))
  channelName.value = "";
}

function inviteToBattleshipGame()
{
  let channelName = document.getElementById('target_user');

  if (channelName.value.length <= 3)
  {
    console.log('Error: One field too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'invite_battleship',
    'target': channelName.value
  }))
  channelName.value = "";
}

function joinChannel(channelName, privacyStatus, password)
{
  console.log('channelName:', channelName, ' privacyStatus:', privacyStatus, ' password:', password)
  if (privacyStatus === false) {
    chatSocket.send(JSON.stringify({
      'type': 'channel_join',
      'target': channelName,
      'privacy_status': privacyStatus
    }))
  } else {
    chatSocket.send(JSON.stringify({
      'type': 'channel_join',
      'target': channelName,
      'privacy_status': privacyStatus,
      'password': password
    }))
  }

}


function leaveChannel(channelName)
{
  chatSocket.send(JSON.stringify({
    'type': 'channel_leave',
    'target': channelName
  }))
  initChatHomepage()
}

function blockUser()
{
  let target = document.getElementById('target_user');

  if (target.value.length <= 3)
  {
    console.log('Error: channel name too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'block_user',
    'target': target.value
  }))
  target.value = "";
}

function unblockUser()
{
  let target = document.getElementById('target_user');

  if (target.value.length <= 3)
  {
    console.log('Error: channel name too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'unblock_user',
    'target': target.value
  }))
  target.value = "";
}

function getLastChats()
{
  chatSocket.send(JSON.stringify({
    'type': 'get_last_chats'
  }))
}


function getAllUsers()
{
  chatSocket.send(JSON.stringify({
    'type': 'get_all_users'
  }))
}


function getHistoryChat(target, msgId)
{
  chatSocket.send(JSON.stringify({
    'type': 'get_history_chat',
    'target': target,
    'msgId': msgId
  }))
}

function getHistoryChannel(channelName, msgId)
{
  chatSocket.send(JSON.stringify({
    'type': 'get_history_channel',
    'target': channelName,
    'msgId': msgId
  }))
}

function displayPrivMsg(data) {
  let mainBoxHeader = document.querySelector(".main_box_header")
  let mainBoxBody = document.querySelector(".main_box_body")

  initPrvMsgHeader(data)
  initPrvMsgBody(data.identification)

  function  initPrvMsgHeader(data) {
    let isConnected
    if (data.connexion_status === 2) {
      isConnected = 'connected'
    } else {
      isConnected = 'disconnected'
    }
    let html =
      '<div class="contact_wrapper" userID="' + data.identification + '">' +
      '<img src="../static/assets/logo/user.png" alt="contact profile picture">' +
      '<div class="contact_name_wrapper">' +
      '<p>' + data.name + '</p>' +
      '<div class="connection_point ' + isConnected + '"></div>' +
      '</div>' +
      '</div>' +
      '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'

    document.querySelector(".main_box_header").innerHTML = html
    mainBoxHeader.children[1].addEventListener("click", () => {
      mainBoxHeader.classList.remove("private_message")
      mainBoxBody.classList.remove("private_message")
      cleanMainBox()
      initChatHomepage()
    })
  }

  function initPrvMsgBody(id) {
    let html =
      '<div class="conversation_wrapper">' +
      '<ul class="conversation"></ul>' +
      '</div>' +
      '<div class="sendbox">' +
      '<input type="text" placeholder="Enter your message">' +
      '<img src="../static/assets/logo/send-solid-60.png" alt="send arrow">' +
      '</div>'
    document.querySelector(".main_box_body").innerHTML = html
    let sendbox = document.querySelector(".sendbox")
    let conversation = document.querySelector(".conversation")
    sendbox.children[0].addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        sendMessage(sendbox.children[0].value, id)
        sendbox.children[0].value = ""
      }
    })
    sendbox.children[1].addEventListener("click", () => {
      sendMessage(sendbox.children[0].textContent, id)
      sendbox.children[0].value = ""
    })

    var lastScrollTop = 0
    conversation.addEventListener("scroll", () => {
      let st = conversation.scrollTop

      if (st <= (lastScrollTop * 0.1)) {
        prvMsgOnTopScroll(id)
      }
      lastScrollTop = st
    })
    getHistoryChat(id, -1)
  }
}

function receiveMsg(data) {
  console.log('page contact:', document.querySelector(".contact_wrapper").getAttribute('userID'), 'data sender:', data.sender)
  if (document.querySelector(".contact_wrapper").getAttribute('userID') === data.sender) {
    let conversation = document.querySelector(".conversation")
    let msgItem =
      "<li class='message_item' msgid='" + data.id + "'>" +
      "<p class='message'>" + data.message + "</p>" +
      "<p class='timestamp'>" + data.time + "</p>" +
      "</li>"
    conversation.lastChild.insertAdjacentHTML('afterend', msgItem)
    conversation.scrollTo(0, conversation.scrollHeight)
  }
}

async function receiveChanMsg(data) {
  let conversation = document.querySelector(".conversation")
  let Response = await fetch(document.location.origin + '/authApp/getUserID',
    {
      method: 'GET'
    })
  if (!Response.ok) {
    throw new Error('Error when fetching user datas')
  }
  let userData = await Response.json()
  let sender, received
  if (data.senderID === userData.userID){
    received = "own"
    sender =  ''
  } else {
    received = ""
    sender = data.sender
  }

  let item =
    '<li class="message_item ' + received + '">' +
    '<div class="sender">' +
    '<img src="../static/assets/logo/user.png" alt="sender profile picture">' +
    '<p>' + sender + '<p>' +
    '</div>' +
    '<div class="messGage_wrapper">' +
    '<p class="message">' + data.message + '</p>' +
    '<p class="timestamp">' + data.time.substring(0, 19) + '</p>' +
    '</div>' +
    '</li>'

  if (conversation.children.length > 0) {
    conversation.lastChild.insertAdjacentHTML("afterend", item)
  } else {
    conversation.innerHTML = item
  }
  conversation.scrollTo(0, conversation.scrollHeight)
}

async function prvMsgOnTopScroll(contactId) {
  let lastMsgId = parseInt(document.querySelector(".conversation > li").getAttribute('msgId'))
  getHistoryChat(contactId, lastMsgId)
}

async function chanOnTopScroll(channelName) {
  let lastMsgId = parseInt(document.querySelector(".conversation > li").getAttribute('msgId'))
  getHistoryChannel(channelName, lastMsgId)
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function actualizeChatHistory(data) {
  let conversation = document.querySelector(".conversation")
  if (data.length === 0) {
    if (conversation.firstChild.classList[0] !== 'top_point') {
      conversation.prepend(document.createElement("div"))
      conversation.children[0].classList.add("top_point")
    }
  } else {
    let loadingHtml = "<img src ='../static/assets/logo/loader-circle-regular-36.png' class='loading'>"
    conversation.firstChild.insertAdjacentHTML("beforebegin", loadingHtml)
    await sleep(300)

    for (let i = 0; i < data.length; i++) {
      let received

      if (data[i].received === true) {
        received = 'own'
      } else {
        received = ''
      }
      let item =
        '<li class="message_item ' + received + '" msgId="' + data[i].id + '">' +
        '<p class="message">' + data[i].message + '</p>' +
        '<p class="timestamp">' + data[i].time.substring(0, 19) + '"</p>' +
        '</li>'

      conversation.firstChild.insertAdjacentHTML("afterend", item)
    }
    conversation.firstChild.remove()
  }
}

async function actualizeChannelHistory(data) {
  let conversation = document.querySelector(".conversation")
  if (data.length === 0) {
    if (conversation.firstChild.classList[0] !== 'top_point') {
      conversation.prepend(document.createElement("div"))
      conversation.children[0].classList.add("top_point")
    }
  } else {
    let loadingHtml = "<img src='../static/assets/logo/loader-circle-regular-36.png' class='loading'>"
    conversation.firstChild.insertAdjacentHTML("beforebegin", loadingHtml)
    await sleep(300)
    let html = ''
    for (let i = data.length - 1; i >= 0; i--) {
      let Response = await fetch(document.location.origin + '/authApp/getUserID',
        {
          method: 'GET'
        })
      if (!Response.ok) {
        throw new Error('Error when fetching user datas')
      }
      let userData = await Response.json()
      let received
      let sender

      if (data[i].senderID !== userData.userID) {
        received = 'own'
        sender = ''
      } else {
        received = ''
        sender = data[i].sender
      }
      let item =
        '<li class="message_item ' + received + '" msgid="' + data[i].id + '">' +
        '<div class="sender">' +
        '<img src="../static/assets/logo/user.png" alt="sender profile picture">' +
        '<p>' + sender + '<p>' +
        '</div>' +
        '<div class="messGage_wrapper">' +
        '<p class="message">' + data[i].message + '</p>' +
        '<p class="timestamp">' + data[i].time.substring(0, 19) + '</p>' +
        '</div>' +
        '</li>'
      html += item
    }
    conversation.firstChild.insertAdjacentHTML("afterend", html)
    conversation.firstChild.remove()
  }
}

function initCreateChannel() {
  let navbar = document.querySelector(".chatbox_homepage_navbar")
  let navbarBTN = document.querySelector("button[name='create_channel']")

  let html =
    '<div class="channel_creation_box">' +
    '<h2>Create a new channel</h2>' +
    '<div class="channel_name_wrapper">' +
    '<p>Channel name:</p>' +
    '<input type="text" name="channel_name" placeholder="Enter channel name" required>' +
    '</div>' +
    '<div class="channel_description_wrapper">' +
    '<p>Channel description:</p>' +
    '<input type="text" name="channel_description" placeholder="Enter channel description" required>' +
    '</div>' +
    '<div class="privacy_setting">' +
    '<p class="privacy_label">Privacy settings</p>' +
    '<div class="privacy_checkbox_wrapper">' +
    '<div class="checkbox_wrapper">' +
    '<input type="checkbox" name="Public"/>' +
    '<label for="Public">Public</label>' +
    '</div>' +
    '<div class="checkbox_wrapper">' +
    '<input type="checkbox" name="Private"/>' +
    '<label for="Private">Private</label>' +
    '</div>' +
    '</div>' +
    '<div class="channel_password_wrapper">' +
    '<label for="password">Channel password</label>' +
    '<input name="password" type="password" placeholder="Enter channel password" disabled="" required>' +
    '<label for="confirm_password">Confirm channel password</label>' +
    '<input name="confirm_password" type="password" placeholder="Confirm channel password" disabled="" required>' +
    '</div>' +
    '</div>' +
    '<div class="submit_wrapper">' +
    '<button class="creation_BTN">Create</button>' +
    '<p class="feedback"></p>'+
    '</div>'

  navbar.insertAdjacentHTML("afterend", html)
  navbarBTN.removeEventListener("click", initCreateChannel)
  navbarBTN.addEventListener("click", closeChannelCreationBox)
  document.querySelector(".channel_creation_box button").addEventListener("click", createChannel)
  document.querySelectorAll(".channel_creation_box input").forEach((inputBox) => {
    inputBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter")
        createChannel()
    })
  })
  let publicCheckbox = document.querySelector("input[name='Public']")
  let privateCheckbox = document.querySelector("input[name='Private']")
  publicCheckbox.addEventListener("change", () => {
    if (privateCheckbox.checked === true)
      privateCheckbox.checked = false
    document.querySelectorAll(".channel_password_wrapper input").forEach((input) => {
      if (input.hasAttribute("disabled") === false)
        input.setAttribute("disabled", "")
    })
  })
  privateCheckbox.addEventListener("change", () => {
    if (publicCheckbox.checked === true)
      publicCheckbox.checked = false
    if (privateCheckbox.checked === true) {
      document.querySelectorAll(".channel_password_wrapper input").forEach((checkbox) => {
        checkbox.removeAttribute("disabled")
      })
    } else {
      document.querySelectorAll(".channel_password_wrapper input").forEach((checkbox) => {
        checkbox.setAttribute("disabled", "")
        checkbox.value = ""
      })
    }
  })

  document.querySelector(".channel_creation_box input").focus()

  function closeChannelCreationBox() {
    document.querySelector(".channel_creation_box").remove()
    let navbarBTN = document.querySelector("button[name='create_channel']")
    navbarBTN.removeEventListener("click", closeChannelCreationBox)
    navbarBTN.addEventListener("click", initCreateChannel)
  }
}

async function createChannel() {
  let channelName = document.querySelector(".channel_creation_box input[name='channel_name']").value
  let channelDescription = document.querySelector(".channel_creation_box input[name='channel_description']").value
  let checkboxes = document.querySelectorAll(".privacy_setting input[type='checkbox']")
  if (checkboxes[0].checked === false && checkboxes[1].checked === false) {
    document.querySelector(".feedback").textContent = "No privacy setting selected"
    return
  }
  if (checkChannelPassword() === false) {
    document.querySelector(".feedback").textContent = "Passwords do not match"
    return
  }
  let pwd = document.querySelector(".channel_password_wrapper input[name='password']").value

  let Response = await fetch(document.location.origin + '/authApp/getUserID',
    {
      method: 'GET'
    })
  if (!Response.ok) {
    throw new Error('Error when fetching user datas')
  }
  let adminData = await Response.json()
  let privacyStatus
  if (checkboxes[0].checked === true)
    privacyStatus = 0
  else
    privacyStatus = 1
  if (channelName.length === 0 || channelDescription.length === 0) {
    let html = '<p class="feedback">Empty field</p>'
    document.querySelector(".channel_creation_box button").insertAdjacentHTML("afterend", html)
    return
  }

  console.log(pwd)
  chatSocket.send(JSON.stringify({
    'type': 'create_channel',
    'channel_name': channelName,
    'channel_description': channelDescription,
    'privacy_status': privacyStatus,
    'password': pwd,
    'adminId': adminData.userID
  }))

  function checkChannelPassword() {
    let pwd = document.querySelector(".channel_password_wrapper input[name='password']").value
    let confirmPwd = document.querySelector(".channel_password_wrapper input[name='confirm_password']").value

    if (pwd === confirmPwd)
      return true
    else
      return false
  }
}

function receiveChanCreation(data) {
  if (data.state === 'failed') {
    document.querySelector(".feedback").textContent = data.reason
    return
  }
  cleanMainBox()
  goToChan(data.channel_name)
}

function receiveJoinChanResponse(data) {
  if (data.state === 'success')
    goToChan(data.channel_name)
  else {
    document.querySelector(".join_channel_box .feedback").textContent = data.reason
  }
}

function receiveDescriptionEdit(data) {
  if (data['state'] === 'failed')
    return
  document.querySelector(".edit_description_box").remove()
  goToChan(data['channel_name'])
}

function kickUser(channelName, username) {
  chatSocket.send(JSON.stringify({
    'type': 'kick_user',
    'channel': channelName,
    'user': username
  })
  )
  goToChan(channelName)
}
