const generateMessage = (username,text) => {
    return {
        username,
        text,
        cretaedAt: new Date().getTime()
    }
}

const generateLocationMessage = (username,url) => {
    return {
        username,
        url,
        cretaedAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}