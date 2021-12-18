export default class Profile {
    constructor() {
        this.profilePostsLink = document.querySelector(".profile-link__posts")
        this.profileFollowersLink = document.querySelector(".profile-link__followers")
        this.profileFollowingLink = document.querySelector(".profile-link__following")
        this.profilePostsList = document.querySelector(".profile-list__posts")
        this.profileFollowersList = document.querySelector(".profile-list__followers")
        this.profileFollowingList = document.querySelector(".profile-list__following")        
        this.lastActiveLink = this.profilePostsLink
        this.lastShownList = this.profilePostsList
        this.events()
    }

    events() {
        this.profilePostsLink.addEventListener("click", (e) => {
            e.preventDefault()
            this.linkActive(this.profilePostsLink)
            this.showList(this.profilePostsList)
        })
        this.profileFollowersLink.addEventListener("click", (e) => {
            e.preventDefault()
            this.linkActive(this.profileFollowersLink)
            this.showList(this.profileFollowersList)
        })
        this.profileFollowingLink.addEventListener("click", (e) => {
            e.preventDefault()
            this.linkActive(this.profileFollowingLink)
            this.showList(this.profileFollowingList)
        })
    }

    showList(listToShow) {
        this.lastShownList.classList.add("d-none")
        listToShow.classList.remove("d-none")
        this.lastShownList = listToShow
    }

    linkActive = (newActiveLink) => {
        this.lastActiveLink.classList.remove("active")
        newActiveLink.classList.add("active")
        this.lastActiveLink = newActiveLink
    }
}
