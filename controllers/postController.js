const User = require('../models/User')
const Post = require("../models/Post")

exports.viewCreateScreen = (req, res) => {
    res.render("create-post", { title: "Create post"})
}

exports.create = (req, res) => {
    let post = new Post(req.body, req.session.user.id)
    post.create()
        .then(async (result) => {
            req.flash("success", "Post successfully created!")
            await req.session.save()
            res.redirect(`/post/${result.insertedId}`)
        })
        .catch(async (errors) => {
            req.flash("errors", errors)
            await req.session.save()
            res.redirect('/create-post')
        })
}

exports.viewSingle = (req, res) => {
    Post.findSingleById(req.params.id, req.visitorId)
        .then((post) => {
            res.render('single-post-screen', { post , title: post.title})
        })
        .catch((e) => {
            res.render(e)
        })
}

exports.viewEditScreen = (req, res) => {
    Post.findSingleById(req.params.id, req.visitorId)
        .then(async (post) => {
            if (post.isVisitorOwner) {
                res.render('edit-post', { post , title: "Edit post"})
            } else {
                req.flash("errors", "You do not have permission.")
                await req.session.save()
                res.redirect('/')
            }
        })
        .catch(async () => {
            res.render('404')
        })
}

exports.edit = (req, res) => {
    let post = new Post(req.body)
    post.update(req.params.id, req.visitorId)
        .then(async () => {
            req.flash("success", "Post succesfully updated")
            await req.session.save()
            res.redirect(`/post/${req.params.id}`)
        })
        .catch(async (e) => {
            if (e == "You do not have permission" || e == "Post does not exist") {
                req.flash("errors", e)
                await req.session.save()
                res.redirect(`/`)
            } else {
                req.flash("errors", e)
                await req.session.save()
                res.redirect(`/post/${req.params.id}/edit`)
            }

        })
}

exports.delete = (req, res) => {
    Post.delete(req.params.id, req.session.user.id)
        .then(async () => {
            req.flash("success", "Post successfully deleted.")
            await req.session.save()
            res.redirect(`/profile/${req.session.user.username}`)
        })
        .catch(async (e) => {
            req.flash("errors", e)
            await req.session.save()
            res.redirect('/')
        })
}

exports.search = (req, res) => {
    Post.search(req.body.searchTerm)
        .then(posts => {
            res.json(posts)
        })
        .catch(e => {
            res.json(e)
        })
}

exports.apiCreate = async (req, res) => {
    console.log(req.apiData)
    await User.findByUsername("123456").then(user => console.log(user._id))
    const user = await User.findByUsername("123456")
    console.log("second" +user._id)
    let post = new Post(req.body, req.apiData._id)
    post.create()
        .then(async () => {
            res.json("Post Successfully Created!")
        })
        .catch(async (errors) => {
            res.json(errors)
        })
}

exports.apiDelete = (req, res) => {
    Post.delete(req.body.id, req.apiData._id)
        .then(async () => {
            res.json("Post successfully deleted")
        })
        .catch(async (e) => {
            res.json(e)
        })
}