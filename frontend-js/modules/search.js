import axios from 'axios'
import DOMPurify from 'dompurify'

export default class Search {
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.headerSearchIcon = document.querySelector(".header-search-icon")
        this.searchOverlay = document.querySelector(".search-overlay")
        this.closeIcon = document.querySelector(".close-live-search")
        this.inputField = document.querySelector("#live-search-field")
        this.loaderIcon = document.querySelector(".circle-loader")
        this.liveSearchResults = document.querySelector(".live-search-results")
        this.listGroup = document.querySelector(".list-group")
        this.waitTimer
        this.previousValue = ""
        this.events()
    }

    events() {
        this.headerSearchIcon.addEventListener("click", (e) => {
            e.preventDefault()
            this.openOverlay()
        })
        this.closeIcon.addEventListener("click", (e) => {
            e.preventDefault()
            this.closeOverlay()
        })
        this.inputField.addEventListener("keyup", () => this.keyPressHander())
    }

    openOverlay() {
        this.searchOverlay.classList.add("search-overlay--visible")
        setTimeout(() => { this.inputField.focus() }, 50)
    }

    closeOverlay() {
        this.searchOverlay.classList.remove("search-overlay--visible")
    }

    keyPressHander() {
        let value = this.inputField.value

        if (value == "") {
            clearTimeout(this.waitTimer)
            this.closeLoaderIcon()
            this.closeResultsHTML()
        }

        if (value != "" && value != this.previousValue) {
            clearTimeout(this.waitTimer)
            this.showLoaderIcon()
            this.closeResultsHTML()
            this.waitTimer = setTimeout(() => this.sendRequest(), 750)
        }

    }

    showLoaderIcon() {
        this.loaderIcon.classList.add("circle-loader--visible")
    }

    closeLoaderIcon() {
        this.loaderIcon.classList.remove("circle-loader--visible")
    }

    sendRequest() {
        axios.post('/search', {_csrf: this._csrf, searchTerm: this.inputField.value })
            .then(res => {
                this.closeLoaderIcon()
                this.renderResultsHTML(res.data)
            })
            .catch((e) => {
                alert('Failed request')
            })
    }

    renderResultsHTML = (posts) => {
        this.liveSearchResults.classList.add("live-search-results--visible")
        if (posts.length) {
            this.liveSearchResults.insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
                <div class="list-group search-results-list shadow-sm">
                    <div class="list-group-item active">
                        <strong>Search Results</strong> (${posts.length > 1 ? `${posts.length} items found` : '1 item found'})
                    </div>
                </div>
            `))
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i]
                let postDate = new Date(post.date)
                document.querySelector(".search-results-list").insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
                    <a href="/post/${post._id}" class="list-group-item list-group-item-action">
                    <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
                    <span class="text-muted small">by ${post.author.username} ${postDate.getMonth() + 1}/${postDate.getDate()}/${postDate.getFullYear()}</span>
                    </a>
                `))
            }            
        } else {
            this.liveSearchResults.insertAdjacentHTML("beforeend", `<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>`)

        }
    }

    closeResultsHTML() {
        this.liveSearchResults.innerHTML = ""
        this.liveSearchResults.classList.remove("live-search-results--visible")
    }
}