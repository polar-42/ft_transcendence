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
  getLastChat()
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
    case 'get_user_data':
      displayPrivMsg(data)
      break
    case 'get_channel_data':
      displayChannel(data)
      break
    case 'chat_history':
      displayChatHistory(data)
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
    case 'chat_private_message':
      receiveMsg(data)
      break
    case 'chat_channel_message':
      receiveChanMsg(data)
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

function displaySearchResult(data) {
  let resultWrapper = document.querySelector(".conversation_list")
  document.querySelector(".main_box_header").insertAdjacentHTML("beforeend", '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return back button" class="back_arrow">')
  document.querySelector(".main_box_header img.back_arrow").addEventListener("click", () => {
    cleanMainBox()
    initChatHomepage()
  })

  while (resultWrapper.children.length > 0) {
    resultWrapper.removeChild(resultWrapper.children[0])
  }

  let isConnected

  for (let i = 0; i < data.length; i++) {
    if (data[i].connexion_status == 2) {
      isConnected = 'connected'
    } else if (data[i].connexion_status === 0) {  
      isConnected = 'disconnected'
    } else {
      isConnected = ''
    }
    let isNoticationActive = ''

    let item = 
      '<li type="' + data[i].type + '">' +
        '<img src="../static/assets/logo/user.png" alt="converstion_picture">' +
        '<div class="conversation_text">' +
          '<div class="conversation_name">' +
            '<p>' + data[i].name + '</p>' +
            '<div class="connection_point ' + isConnected + '"></div>' +
          '</div>' +
          '<p class="last_msg"></p>' +
        '</div>' +
        '<div class="notification_wrapper ' + isNoticationActive + '"></div>' +
      '</li>'

    if (resultWrapper.children.length > 0) {
      resultWrapper.lastChild.insertAdjacentHTML("afterend", item)
    } else {
      resultWrapper.innerHTML = item
    }
    resultWrapper.lastChild.addEventListener("click", () => {
      if (data[i].type === 'private_message') { 
        goToConv(data[i].identification)
      } else if (data[i].type === 'channel') {
        goToChan(data[i].name)
      }
    })
  }
}

function displayChatHistory(data) {
  let conversation = document.querySelector(".conversation")
  for (let i = 0 ; i < data['data'].length - 1; i++) {
    let sender 
    if (data['data'][i].received === true) {
      sender = ''
    } else {
      sender = 'own'
    }

    let item = 
						'<li class="message_item" msgid=' + data['data'][i].id + '>' +
							'<p class="message">' + data['data'][i].message + '</p>' +
							'<p class="timestamp">' + data['data'][i].time.substring(0, 19) + '</p>' +
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
    let html = 
      '<div class="contact_wrapper">' +
        '<img src="../static/assets/logo/user.png" alt="channel picture">' +
        '<div class="contact_name_wrapper">' +
          '<p class="channel_name">' + data.name + '</p>' +
          '<p class="channel_description">' + data.description + '</p>' +
        '</div>' +
      '</div>' +
      '<img src="../static/assets/logo/arrow-back-regular-60.png" alt="return arrow button">'


    document.querySelector(".main_box_header").innerHTML = html
    document.querySelector(".main_box_header").children[1].addEventListener("click", () => {
      document.querySelector(".main_box_header").classList.remove("channel")
      document.querySelector(".main_box_body").classList.remove("channel")
      cleanMainBox()
      initChatHomepage()
    })
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
            '</div>'

          if (sidebar.children.length > 0) {
            sidebar.lastChild.insertAdjacentHTML("afterend", item)
          } else {
            sidebar.innerHTML = item
          }
        }
      }
    }
  }
}


async function displayChannelHistory(data) {
  let conversation = document.querySelector(".conversation")
  let Response = await fetch(document.location.origin + '/authApp/getUserID/',
    {
      method: 'GET'
    })
  if (!Response.ok) {
    throw new Error('Error when fetching user datas')
  }
  let userData = await Response.json()

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
        '<p>' +sender + '</p>' +
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
  console.log('target: ', name)
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
  conversation.lastChild.insertAdjacentHTML('afterend', html)
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

function joinChannel()
{
  let channelName = document.getElementById('target_user');

  if (channelName.value.length <= 3)
  {
    console.log('Error: channel name too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'channel_join',
    'target': channelName.value
  }))
  channelName.value = "";
}


function leaveChannel()
{
  let channelName = document.getElementById('target_user');

  if (channelName.value.length <= 3)
  {
    console.log('Error: channel name too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'channel_leave',
    'target': channelName.value
  }))
  channelName.value = "";
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

function getLastChat()
{
  chatSocket.send(JSON.stringify({
    'type': 'get_last_chat'
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
      '<div class="contact_wrapper userID="' + data.identification + '">' +
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
  let Response = await fetch(document.location.origin + '/authApp/getUserID/',
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
  console.log(lastMsgId)
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

    for (let i = 0; i < data.length - 1; i++) {
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
      let Response = await fetch(document.location.origin + '/authApp/getUserID/',
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
        '<input type="text" name="channel_name" placeholder="Enter channel name">' +
      '</div>' +
      '<div class="channel_description_wrapper">' +
        '<p>Channel description:</p>' +
        '<input type="text" name="channel_description" placeholder="Enter channel description">' +
      '</div>' +
      '<div class="privacy_setting>' +
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
  let checkboxes = document.querySelectorAll(".privacy_checkbox_wrapper input")
  checkboxes.forEach((input) => {
    input.addEventListener("change", () => {
      checkboxes.forEach((item) => {
        if (item !== input) 
          item.checked = false
      })
    })
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
  let Response = await fetch(document.location.origin + '/authApp/getUserID/',
    {
      method: 'GET'
    })
  if (!Response.ok) {
    throw new Error('Error when fetching user datas')
  }
  let adminData = await Response.json()
  let checkboxes = document.querySelectorAll(".privacy_checkbox_wrapper input")
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

  chatSocket.send(JSON.stringify({
    'type': 'create_channel',
    'channel_name': channelName,
    'channel_description': channelDescription,
    'privacy_status': privacyStatus,
    'adminId': adminData.userID
  }))
}

