const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessgaeStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessgaeStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = ($messages.scrollTop + visibleHeight)*2

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg)=> {
    console.log(msg)
    const html = Mustache.render($messageTemplate,{
        username : msg.username,
        message: msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (msg) => {
    const html = Mustache.render($locationMessageTemplate,{
        username : msg.username,
        url: msg.url,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room , users}) => {
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message,(error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
           latitude :  position.coords.latitude,
           longitude : position.coords.longitude
        },()=> {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join', {username,room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
