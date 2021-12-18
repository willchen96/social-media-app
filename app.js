const express = require("express")
const app = express()
const router = require("./router")
const path = require("path")

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use("/api", require("./router-api"))

const session = require("express-session")
const MongoStore = require('connect-mongo')
const sessionOptions = session({
    secret: "This is the secret",
    store: MongoStore.create({ client: require('./db') }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60* 60 *24, //1 day
        httpOnly: true
    }
})
const flash = require("connect-flash")
const markdown = require("marked")
const sanitizeHTML = require('sanitize-html')
const csrf = require('csurf')

app.use(sessionOptions)
app.use(flash())
app.use((req, res, next) => {
  // Make markdown function available from within the EJS template
  res.locals.filterUserHTML = content => markdown(content)
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")
  if (req.session.user) {
      req.visitorId = req.session.user.id
  } else {
      req.visitorId = 0
  }
  //make user session data available within view template
  res.locals.user = req.session.user
  next()
})
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.static("public"))


app.use(csrf())
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
})
app.use("/", router)
app.use(async (err, req, res, next) => {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site request forgery detected.")
      await req.session.save()
      res.redirect("/")
    } else {
      res.send("Something went wrong:" + e)
    }
  }
  next()
})


const server = require('http').createServer(app)
const io = require('socket.io')(server)


io.use(function(socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
  })
  
  io.on('connection', function(socket) {
    if (socket.request.session.user) {
      let user = socket.request.session.user
  
      socket.emit('welcome', {username: user.username, avatar: user.avatar})
  
      socket.on('chatMessageFromBrowser', function(data) {
        socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
      })
    }
  })
module.exports = server


