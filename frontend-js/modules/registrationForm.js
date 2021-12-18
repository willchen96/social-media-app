import axios from 'axios'
import validator from 'validator'

export default class RegistrationForm {
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.username = document.querySelector("#username-register")
        this.email = document.querySelector("#email-register")
        this.password = document.querySelector("#password-register")
        this.form = document.querySelector("#registration-form")
        this.username.previousValue = ""
        this.email.previousValue = ""
        this.password.previousValue = ""
        this.insertValidationElements()
        this.events()
    }

    events() {
        this.username.addEventListener("keyup", () => {
            if(!this.isDifferent(this.username)) return
            this.usernameHandler(800)
        })
        this.email.addEventListener("keyup", () => {
            if(!this.isDifferent(this.email)) return
            this.emailHandler(800)
        })
        this.password.addEventListener("keyup", () => {
            if(!this.isDifferent(this.password)) return
            this.passwordHandler(800)
        })
        this.form.addEventListener("submit", e => {
            e.preventDefault()
            this.submitHandler()
        })
    }

    isDifferent(el) {
        el.errors = false
        if(el.previousValue != el.value) {
            el.previousValue = el.value
            return true
        } 
        el.previousValue = el.value
    }

    usernameHandler(delay) {

        if (this.username.value != "" && !validator.isAlphanumeric(this.username.value)) {
            this.showValidationError(this.username, "Username can only contain letters and numbers.")
        }

        if (this.username.value.length > 20) {
            this.showValidationError(this.username, "Username cannot exceed 30 characters.")
        }

        clearTimeout(this.username.timer)
        if(this.username.errors) return
        this.username.timer = setTimeout(() => {
            if (this.username.value.length < 3) {
                this.showValidationError(this.username, "Username must be at least 3 characters.")
            }
            axios.post('/usernameTaken', {_csrf: this._csrf, username: this.username.value})
                .then((res) =>  {
                    if (res.data) {
                        this.showValidationError(this.username, "Username is taken.")
                    }
                })
        }, delay)

        if (!this.username.errors) this.hideValidationError(this.username)

    }

    emailHandler(delay) {
        setTimeout(() => {
            if (!validator.isEmail(this.email.value)) {
                this.showValidationError(this.email, "You must provide a valid email address.")
                return
            }
            axios.post('/emailTaken', {_csrf: this._csrf, email: this.email.value})
                .then((res) => {
                    if (res.data) {
                        this.showValidationError(this.email, "Email is taken.")
                    }
                })
        }, delay) 
        
        if (!this.email.errors) this.hideValidationError(this.email)
    }

    passwordHandler(delay) {
        if (this.password.value == "") {
            this.showValidationError(this.password, "You must provide a password.")
            return
        }
        setTimeout(() => {
            if (this.password.value.length < 12) {
                this.showValidationError(this.password, "Password cannot be less than 12 characters")
            }
            if (this.password.value.length > 50) {
                this.showValidationError(this.password, "Password cannot exceed 50 characters")
            }
        }, delay)
        

        if (!this.password.errors) this.hideValidationError(this.password)
    }

    submitHandler(){
        this.usernameHandler()
        this.emailHandler()
        this.passwordHandler()
        if (this.username.errors && this.email.errors && this.password.errors) return
        axios.post("/register", {_csrf: this._csrf, username: this.username.value, email: this.email.value, password: this.password.value})
            .then(() => {
                window.location = "/"
            })
            .catch(() => {
                window.location = '/'
            })
    }

    insertValidationElements() {
        this.allFields.forEach(field => {
            field.insertAdjacentHTML("afterend", `
                <div class="alert alert-danger small liveValidateMessage">Hello</div>
            `)
        })
    }

    showValidationError(el, message) {
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.nextElementSibling.innerHTML = message
        el.errors = true
    }

    hideValidationError(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }
}