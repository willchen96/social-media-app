import Search from './modules/search'
import Profile from './modules/profile'
import Close from './modules/close'
import Chat from './modules/chat'
import RegistrationForm from './modules/registrationForm'

if (document.querySelector("#registration-form")) {
    new RegistrationForm()
}

if (document.querySelector(".header-search-icon")) {
    new Search()
}

if (document.querySelector(".profile-link__posts")) {
    new Profile()
}

if (document.querySelectorAll(".close")) {
    new Close()
}

if (document.querySelector("#chat-wrapper")) {
    new Chat()
}
