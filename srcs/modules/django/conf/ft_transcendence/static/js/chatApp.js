// import { convertArray } from "three/src/animation/AnimationUtils.js";
import { checkConnexion } from "./authApp.js";


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

  let html = '<img src="../static/assets/logo/search-regular-24.png" alt="search icon"><input type="text" name"searchbar">'
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
	  '</div>'
  mainBoxBody.innerHTML = html
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
}

function closeChatSocket()
{
  chatSocket = undefined;
}

function onMessageChat(e)
{
  const data = JSON.parse(e.data)

  switch (data['type']) {
    case 'search_conv':
      displaySearchResult(data.data) 
      break
    case 'get_user_data':
      displayPrivMsg(data)
      break
    case 'chat_history':
      displayChatHistory(data)
      break
    case 'actualize_chat_history':
      actualizeChatHistory(data.data)
      break
    case 'chat_private_message':
      receiveMsg(data)
  }
}

function displaySearchResult(data) {
  let resultWrapper = document.querySelector(".conversation_list")

  while (resultWrapper.children.length > 0) {
    resultWrapper.removeChild(resultWrapper.children[0])
  }

  let isConnected

  for (let i = 0; i < data.length; i++) {
    if (data[i].connexion_status == 2) {
      isConnected = 'connected'
    } else { 
      isConnected = 'disconnected'
    }
    let isNoticationActive = ''

    let item = 
      '<li>' +
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
      goToConv(data[i].identification)
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

function goToConv(data) {
  let mainBoxBody = document.querySelector(".main_box_body")
  let mainBoxHeader = document.querySelector(".main_box_header")
  cleanMainBox()
  mainBoxBody.classList.add("private_message")
  mainBoxHeader.classList.add("private_message")
  chatSocket.send(JSON.stringify({
    'type': 'get_user',
    'target': data
  })
  )
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

function invitationPong(data)
{
  if (confirm('Your received an invitation to pong game by ' + data.sender))
  {
    console.log('lets go');
    chatSocket.send(JSON.stringify({
      'type': 'accept_invitation',
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

function channelMessage()
{
  let message = document.getElementById('message_chat');
  let channelName = document.getElementById('target_user');

  if (channelName.value.length <= 3)
  {
    console.log('Error: One field too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'channel_message',
    'target': channelName.value,
    'message': message.value
  }))
  channelName.value = "";
  message.value = "";
}

function invitePong()
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

function getHistoryChannel()
{
  let target = document.getElementById('target_user');

  if (target.value.length <= 3)
  {
    console.log('Error: channel name too small');
    return;
  }

  chatSocket.send(JSON.stringify({
    'type': 'get_history_channel',
    'target': target.value
  }))
  target.value = "";
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
    conversation.addEventListener("scroll", () => {
      if (conversation.scrollTop === 0) {
        prvMsgOnTopScroll(id)
      }
    })
    getHistoryChat(id, -1)
  }
}

function receiveMsg(data) {
  if (document.querySelector(".contact_wrapper").getAttribute('userID') === data.sender) {
    let conversation = document.querySelector(".conversation")
    let msgItem = "<li class='message_item' msgid='" + data.id + "'><p class='message'>" +
      data.message +
      "</p><p class='timestamp'>" +
      data.time +
      "</p></li>"
    conversation.lastChild.insertAdjacentHTML('afterend', msgItem)
    conversation.scrollTo(0, conversation.scrollHeight)
  }
}

function prvMsgOnTopScroll(contactId) {
  let lastMsgId = parseInt(document.querySelector(".conversation > li").getAttribute('msgId')) - 1
  getHistoryChat(contactId, lastMsgId)
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
    await sleep(500)

    for (let i = data.length - 1; i >= 0; i--) {
      let received

      if (data[i].received === true) {
        received = 'own'
      } else {
        received = ''
      }
      let item = 
        '<li class="message_item ' + received + '" msgId="' + data[i].id + '>' +
        '<p class="message">' + data[i].message + '</p>' +
        '<p class="timestamp">' + data[i].time.substring(0, 19) + '"</p>' +
        '</li>'

      conversation.firstChild.insertAdjacentHTML("afterend", item)
    }
    conversation.firstChild.remove()
  }
}
