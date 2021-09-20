const genMessage = (msg, username) =>{

    return {message : msg,
            createdAt : new Date().getTime(),
            username
        }
}
const genLocationMessage = (msg, username) =>{

    return {url : msg,
            createdAt : new Date().getTime(),
            username
        }
}
module.exports = {genMessage, genLocationMessage}