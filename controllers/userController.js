const User = require('../models/User')
const Post = require("../models/Post")
const Follow = require("../models/Follow")
const jwt = require("jsonwebtoken")

exports.login = (req, res) => {
    let user = new User(req.body)
    user.login()
        .then(async () => {
            req.session.user = {
                username: user.username,
                avatar: user.avatar,
                id: user.id,
                darkMode: true
            }
            await req.session.save()
            res.redirect("/")
        })
        .catch(async (e) => {
            req.flash('errors', e)
            await req.session.save()
            res.redirect('/')
        })
}

exports.logout = function (req, res) {
    if (req.session.user) {
        req.session.destroy(() => res.redirect("/"))
    }
}

exports.register = function (req, res) {
    let user = new User(req.body)
    user.register()
        .then(async () => {
            req.session.user = {
                username: user.username,
                avatar: user.avatar,
                id: user.id,
                darkMode: true,
            }
            await req.session.save()
            res.redirect("/")
        })
        .catch(async (e) => {
            req.flash("regErrors", e)
            await req.session.save()
            res.redirect("/")
        })
}

exports.home = async (req, res) => {
    if (req.session.user) {
        let posts = await Post.getFeed(req.visitorId)
        res.render("home-dashboard", {posts, title: "Home"})
    } else {
        res.render("home-guest", {regErrors: req.flash("regErrors") })

    }
}

exports.loggedIn = async (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("errors", "Must be logged in to perform that action.")
        await req.session.save()
        res.redirect('/')
    }
}


exports.userExists = async (req, res, next) => {
    User.findByUsername(req.params.username)
        .then((userDoc) => {
            req.userDoc = userDoc
            next()
        })
        .catch(() => res.render('404'))
}

exports.usernameTaken = (req, res) => {
    User.findByUsername(req.body.username)
        .then(() => res.json(true))
        .catch(() => res.json(false))
}

exports.emailTaken = async (req, res) => {
    const taken = await User.findByEmail(req.body.email)
    res.json(taken)
}

exports.profileScreen = async (req, res) => {
    const userProfile = req.userDoc
    const posts = await Post.findByAuthorId(req.userDoc._id, req.visitorId)
    const followers = await Follow.findFollowersById(req.userDoc._id)
    const following = await Follow.findFollowingById(req.userDoc._id)
    let isVisitorsProfile = false
    if (req.userDoc._id == req.visitorId) {
        isVisitorsProfile = true
    }
    const follow = new Follow(req.userDoc.username, req.visitorId)
    const visitorIsFollowing = await follow.exists()
    res.render('profile', { userProfile, posts, followers, following, isVisitorsProfile, visitorIsFollowing, title: userProfile.username })
}

exports.apiLogin = (req, res) => {
    let user = new User(req.body)
    user.login()
        .then(async () => {
            res.json(jwt.sign({_id: user.id}, process.env.JWTSECRET , {expiresIn: "7d"}))
        })
        .catch(async (e) => {
            res.json("Sorry your values are not correct.")
        })
}

exports.apiLoggedIn = async (req, res, next) => {
    try {
        req.apiData = jwt.verify(req.body.token, process.env.JWTSECRET)
        next()
    } catch {
        res.json("You must be logged in.")
    }
}

exports.apiGetPostsByUsername = async (req, res) => {
    try {
        const user = await User.findByUsername(req.params.username)
        const posts = await Post.findByAuthorId(user._id)
        res.json(posts)
    } catch {
        res.json("Could not find posts.")
    }
    
}