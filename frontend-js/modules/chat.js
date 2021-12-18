const DOMPurify = require('dompurify')

export default class Chat {
    constructor() {
        this.connectionOpened = false
        this.chatWrappers = document.querySelectorAll("#chat-wrapper")
        this.openIcon = document.querySelector(".header-chat-icon")
        this.injectHTML()
        this.chatLog = document.querySelector("#chat")
        this.chatForms = document.querySelectorAll("#chatForm")
        this.closeIcons = document.querySelectorAll(".chat-title-bar-close")

        this.events()
    }

    events() {
        this.chatForms.forEach(chatForm => {
            chatForm.addEventListener("submit", (e) => {
                e.preventDefault()
                this.sendMessagetoServer(chatForm)
            })
        })
        
        this.closeIcons.forEach(closeIcon => {
            closeIcon.addEventListener("click", e => {
                this.closeChat(closeIcon.parentElement.parentElement)
            })
        })
        this.openIcon.addEventListener("click", e => {
            this.showChat()
        })
    }

    injectHTML() {
        this.chatWrappers.forEach(chatWrapper => {
            chatWrapper.innerHTML =`
                <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
                    <div id="chat" class="chat-log"></div>
                
                    <form id="chatForm" class="chat-form border-top">
                        <input id="chatField" type="text" class="chat-field" placeholder="Type a message…" autocomplete="off">
                    </form>
                </div>
            `
        })
    }

    showChat() {
        if (!this.connectionOpened) {
            this.openConnection()
            this.connectionOpened = true
        }        
        this.chatWrappers.forEach(chatWrapper => {
            chatWrapper.classList.add("chat--visible")
            const chatField = chatForm.querySelector("#chatField")
            chatField.focus()
        })
    }

    closeChat(chat) {
        chat.classList.remove("chat--visible")
    }

    openConnection() {
        this.socket = io()
        this.socket.on("welcome", (data) => {
            this.avatar = data.avatar
        })
        this.socket.on('chatMessageFromServer', (data) => {
            this.chatLog.insertAdjacentHTML("beforeend", `
                <div class="chat-other">
                <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
                    <div class="chat-message">
                        <div class="chat-message-inner">
                            <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
                            ${data.message}
                        </div>
                    </div>
                </div>
            `)
            this.chatLog.scrollTop = this.chatLog.scrollHeight
        })
    }

    sendMessagetoServer(chatForm) {
        const chatField = chatForm.querySelector("#chatField")
        if (chatField.value) {
            this.socket.emit("chatMessageFromBrowser", {message: chatField.value})
            this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
                <div class="chat-self">
                    <div class="chat-message">
                    <div class="chat-message-inner">
                        ${chatField.value}
                    </div>
                    </div>
                    <img class="chat-avatar avatar-tiny" src="${this.avatar}">
                </div>
            `))
            this.chatLog.scrollTop = this.chatLog.scrollHeight
            chatField.value = ''
            chatField.focus()
        }
    }
}