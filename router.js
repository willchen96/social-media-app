const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")

// user routes
router.get("/", userController.home)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.post("/usernameTaken", userController.usernameTaken)
router.post("/emailTaken", userController.emailTaken)

// post routes
router.get("/create-post", userController.loggedIn, postController.viewCreateScreen)
router.post("/create-post", userController.loggedIn, postController.create)
router.get("/post/:id", postController.viewSingle)
router.get("/post/:id/edit", userController.loggedIn, postController.viewEditScreen)
router.post("/post/:id/edit", userController.loggedIn, postController.edit)
router.post("/post/:id/delete",  postController.delete)
router.post("/search", userController.loggedIn, postController.search)

// profile routes
router.get("/profile/:username", userController.userExists, userController.profileScreen)

// follow routes
router.post("/follow/:username", userController.userExists, userController.loggedIn, followController.follow)
router.post("/unfollow/:username", userController.userExists, userController.loggedIn, followController.unfollow)

module.exports = router 