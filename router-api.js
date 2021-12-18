const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
const cors = require("cors")

apiRouter.use(cors())

apiRouter.post("/login", userController.apiLogin)
apiRouter.post("/create-post", userController.apiLoggedIn, postController.apiCreate)
apiRouter.delete("/delete-post", userController.apiLoggedIn, postController.apiDelete)
apiRouter.get("/postsByUsername/:username", userController.apiGetPostsByUsername)

module.exports = apiRouter