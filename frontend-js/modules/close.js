export default class Close {
    constructor() {
        this.closeButtons = document.querySelectorAll(".close")
        this.event()
    }

    event() {
        this.closeButtons.forEach(closeButton => {
            closeButton.addEventListener("click", function(e) {
                e.preventDefault()
                this.parentElement.remove()
            })
        })
    }
}