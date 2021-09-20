const socket = io()

//elements
const $msgForm = document.querySelector('#msgForm')
const $msgButton = $msgForm.querySelector('#sendMsg')
const $msgInput = $msgForm.querySelector('input')
const $sendLocationButton = document.querySelector("#sendLocation")
const $messages = document.querySelector("#messagesDiv")
const $sidebar = document.querySelector("#sidebar")

//templates
const $messageTemplate = document.querySelector("#messageTemplate").innerHTML
const $locationTemplate = document.querySelector("#locationTemplate").innerHTML
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

socket.on('countUpdated', (count)=>{
    console.log('count was updated to ', count)
})

//receives messages from server
socket.on('locationMessage', ({url, createdAt, username})=>{

    const html = Mustache.render($locationTemplate, {
        url,
        createdAt:moment(createdAt).format("DD-MM-YY h:mm:ss a"),
        username
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


//receives messages from server
socket.on('message', ({message, createdAt, username})=>{

    const html = Mustache.render($messageTemplate, {
        message,
        createdAt:moment(createdAt).format("DD-MM-YY h:mm:ss a"),
        username
    })
    $messages.insertAdjacentHTML('', html)
})

//receives messages from server
socket.on('userList', ({room, users})=>{
    console.log(users)
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

//submiting the message to server
$msgForm.addEventListener('submit', (e) =>{
    e.preventDefault()

    const msg = e.target.elements.message.value
    
    $msgButton.setAttribute('disabled', 'disabled')
    $msgInput.value = ''
    $msgInput.focus()
    
    socket.emit('sendMessage', msg, (response) =>{
        console.log(response)
        $msgButton.removeAttribute('disabled')
    })
})

//sending location
$sendLocationButton.addEventListener('click',() =>{
    if(!navigator.geolocation){
        return alert('location not available')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((pos) =>{

        socket.emit('sendLocation', {
            latitude : pos.coords.latitude,
            longitude : pos.coords.longitude
        }, () =>{
            console.log("location shared")
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (message) =>{
    alert(message)
    location.href = '/'
})