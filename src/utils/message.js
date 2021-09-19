const genMessage = (msg) =>{

    return {message : msg,
            createdAt : new Date().getTime()
        }
}
const genLocationMessage = (msg) =>{

    return {url : msg,
            createdAt : new Date().getTime()
        }
}
module.exports = {genMessage, genLocationMessage}