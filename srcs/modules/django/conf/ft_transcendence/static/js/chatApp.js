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
  mainBoxHeader.appendChild(document.createElement("img"))
  mainBoxHeader.children[0].src = "../static/assets/logo/search-regular-24.png";
  mainBoxHeader.children[0].alt = "search icon";
  let searchBar = mainBoxHeader.appendChild(document.createElement("input"))
  searchBar.type = "text"
  searchBar.name = "searchbar"
  searchBar.placeholder = "Search a user or a channel"
  searchBar.addEventListener("keypress", (event) => {
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
  let title = mainBoxBody.appendChild(document.createElement("h2"))
  title.textContent = "Discussions"
  let conversationList = mainBoxBody.appendChild(document.createElement("ul"))
  conversationList.classList.add("conversation_list")
  let navbar = mainBoxBody.appendChild(document.createElement("div"))
  navbar.classList.add("chatbox_homepage_navbar")
  let discussionButton = navbar.appendChild(document.createElement("button"))
  let friendsButton = navbar.appendChild(document.createElement("button"))
  discussionButton.name = "discussions"
  discussionButton.textContent = "Discussions"
  friendsButton.name = "friends"
  friendsButton.textContent = "Friends"
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
    //document.getElementById('chat_submit').addEventListener("click", sendMessage);
  //document.getElementById('channel_submit').addEventListener("click", channelMessage);
  //document.getElementById('invite_pong').addEventListener("click", invitePong);
  //document.getElementById('channel_join').addEventListener("click", joinChannel);
  //document.getElementById('channel_leave').addEventListener("click", leaveChannel);
  //document.getElementById('user_block').addEventListener("click", blockUser);
  //document.getElementById('user_unblock').addEventListener("click", unblockUser);
  //document.getElementById('get_last_chat').addEventListener("click", getLastChat);
  //document.getElementById('get_all_users').addEventListener("click", getAllUsers);
  //document.getElementById('get_history_chat').addEventListener("click", getHistoryChat);
  //document.getElementById('get_history_channel').addEventListener("click", getHistoryChannel);

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
    case 'chat_private_message':
      receiveMsg(data)
  }
  // if (data.type == 'invitation_pong')
  // {
  // 	invitationPong(data)
  // }
}

function displaySearchResult(data) {
  let resultWrapper = document.querySelector(".conversation_list")

  while (resultWrapper.children.length > 0) {
    resultWrapper.removeChild(resultWrapper.children[0])
  }

  for (let i = 0; i < data.length; i++) {
    let item = document.createElement("li")
    item.appendChild(document.createElement("img"))
    item.children[0].src = "../static/assets/logo/user.png"
    item.children[0].alt = "conversation_picture"
    item.appendChild(document.createElement("div"))
    item.children[1].classList.add('conversation_name')
    item.children[1].appendChild(document.createElement("p"))
    item.children[1].children[0].textContent = data[i].name
    item.children[1].appendChild(document.createElement("div"))
    if (data[i].connexion_status === 2) {
      item.children[1].children[1].classList.add("connection_point", "connected")
    } else if (data[i].connexion_status === 0) {
      item.children[1].children[1].classList.add("connection_point", "disconnected")
    }
    item.appendChild(document.createElement("p"))
    item.children[2].classList.add("last_msg")
    item.children[2].textContent = data[i].last_msg
    item.addEventListener("click", () => {
      goToConv(data[i].identification)
    })
    resultWrapper.appendChild(item)
  }
}

function displayChatHistory(data) {
  let conversation = document.querySelector(".conversation")
    console.log(data['data'])
  for (let i = 0; i < data['data'].length; i++) {
    console.log(data['data'][i])
    let item = conversation.appendChild(document.createElement("li"))
    if (data['data'][i].received === true) {
      item.classList.add("message_item")
    } else {
      item.classList.add("message_item", "own")
    }
    item.appendChild(document.createElement("p"))
    item.children[0].classList.add("message")
    item.children[0].textContent = data['data'][i].message
    item.appendChild(document.createElement("p"))
    item.children[1].classList.add("timestamp")
    item.children[1].textContent = data['data'][i].time.substring(0, 19);
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
  conversation.appendChild(document.createElement("li"))
  conversation.lastChild.classList.add("message_item", "own")
  conversation.lastChild.appendChild(document.createElement("p"))
  conversation.lastChild.lastChild.classList.add("message")
  conversation.lastChild.lastChild.textContent = message
  conversation.lastChild.appendChild(document.createElement("p"))
  conversation.lastChild.lastChild.classList.add("timestamp")
  conversation.lastChild.lastChild.textContent = timestamp 
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


function getHistoryChat(target)
{
  chatSocket.send(JSON.stringify({
    'type': 'get_history_chat',
    'target': target
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
    let contactWrapper = mainBoxHeader.appendChild(document.createElement("div"))

    contactWrapper.classList.add("contact_wrapper")
    contactWrapper.setAttribute('userID', data.identification)
    contactWrapper.appendChild(document.createElement("img"))
    contactWrapper.children[0].src = "../static/assets/logo/user.png"
    let contactNameWrapper = contactWrapper.appendChild(document.createElement("div"))
    contactNameWrapper.classList.add("contact_name_wrapper")
    contactNameWrapper.appendChild(document.createElement("p"))
    contactNameWrapper.children[0].textContent = data.name
    contactNameWrapper.appendChild(document.createElement("div"))
    if (data.connexion_status === 0) {
      contactNameWrapper.children[1].classList.add("connection_point", "disconnected")
    }
    else if (data.connexion_status === 2) {
      contactNameWrapper.children[1].classList.add("connection_point", "connected")
    }
    mainBoxHeader.appendChild(document.createElement("img"))
    mainBoxHeader.children[1].src = "../static/assets/logo/arrow-back-regular-60.png"
    mainBoxHeader.children[1].alt = "return arrow button"
    mainBoxHeader.children[1].addEventListener("click", () => {
      mainBoxHeader.classList.remove("private_message")
      mainBoxBody.classList.remove("private_message")
      cleanMainBox()
      initChatHomepage()
    })
  }

  function initPrvMsgBody(id) {
    let conversationWrapper = mainBoxBody.appendChild(document.createElement("div"))
    let sendbox = mainBoxBody.appendChild(document.createElement("div"))
    conversationWrapper.classList.add("conversation_wrapper")
    sendbox.classList.add("sendbox")
    conversationWrapper.appendChild(document.createElement("ul"))
    conversationWrapper.children[0].classList.add("conversation")
    sendbox.appendChild(document.createElement("input"))
    sendbox.children[0].type = "text"
    sendbox.children[0].placeholder = "Enter your message"
    sendbox.appendChild(document.createElement("img"))
    sendbox.children[1].src = "../static/assets/logo/send-solid-60.png"
    sendbox.children[1].alt = "send arrow"
    sendbox.children[0].addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        console.log(sendbox.children[0].value, id)
        sendMessage(sendbox.children[0].value, id)
        sendbox.children[0].value = ""
      }
    })
    sendbox.children[1].addEventListener("click", () => {
      sendMessage(sendbox.children[0].textContent, id)
      sendbox.children[0].value = ""
    })
    getHistoryChat(id)
  }
}

function receiveMsg(data) {
  if (document.querySelector(".contact_wrapper").getAttribute('userID') === data.sender) {
    let conversation = document.querySelector(".conversation")
    conversation.appendChild(document.createElement("li"))
    conversation.lastChild.classList.add("message_item")
    conversation.lastChild.appendChild(document.createElement("p"))
    conversation.lastChild.lastChild.classList.add("message")
    conversation.lastChild.lastChild.textContent = data.message
    conversation.lastChild.appendChild(document.createElement("p"))
    conversation.lastChild.lastChild.classList.add("timestamp")
    conversation.lastChild.lastChild.textContent = data.time
    conversation.scrollTo(0, conversation.scrollHeight)
  }
}
