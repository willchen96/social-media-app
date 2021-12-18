const postsCollection = require("../db").db().collection("posts")
const { ObjectId } = require('mongodb')
const User = require("./User")
const Follow = require("./Follow")
const sanitizeHTML = require("sanitize-html")
const { findFollowedIdsbyId } = require("./Follow")


class Post {
    constructor(data, authorId) {
        this.title = data.title
        this.body = data.body
        this.date = new Date()
        this.author = ObjectId(authorId)
        this.errors = []
    }

    cleanUp() {
        if (typeof (this.title) != "string") {
            this.title = ""
        } else {
            this.title.trim()
        }
        if (typeof (this.body) != "string") {
            this.body = ""
        } else {
            this.body.trim()
        }
        //santize inputs
        this.title = sanitizeHTML(this.title, {allowedTags: [], allowedAttributes: []})
        this.body = sanitizeHTML(this.body, {allowedTags: [], allowedAttributes: []})
    }

    validate() {
        if (this.title == "") {
            this.errors.push("You must provide a title.")
        }
        if (this.body == "") {
            this.errors.push("You must provide a body.")
        }
    }

    create() {
        return new Promise((resolve, reject) => {
            this.cleanUp()
            this.validate()
            if (this.errors.length == 0) {
                postsCollection.insertOne({ title: this.title, body: this.body, date: this.date, author: this.author })
                    .then((result) => {
                        resolve(result)
                    })
                    .catch((e) => {
                        reject("Something went wrong.")
                    })
            } else {
                reject(this.errors)
            }
        })
    }

    update(postId, visitorId) {
        return new Promise(async (resolve, reject) => {
            try {
                let post = await Post.findSingleById(postId, visitorId)
                if (post.isVisitorOwner != true) {
                    reject("You do not have permission")
                    return
                }
            } catch (e) {
                reject(e)
                return
            }    
            this.cleanUp()
            this.validate()
            if (this.errors.length == 0) {
                await postsCollection.findOneAndUpdate({ _id: ObjectId(postId)}, { $set: { title: this.title, body: this.body }})
                resolve()
            } else {
                reject(this.errors)
            }
            
        })
    }    

}

Post.reusablePostQuery = function (uniqueOperations, visitorId, finalOperations = []) {
    return new Promise(async function (resolve, reject) {
        
        // Add user document to post document
        const aggregateOperations = uniqueOperations.concat([
            { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            { $project: {  title: 1, body: 1, date: 1, author: { $arrayElemAt: ["$authorDocument", 0] } } }
        ]).concat(finalOperations)


        let posts = await postsCollection.aggregate(aggregateOperations).toArray()
        posts = posts.map(function (post) {
            post.isVisitorOwner = post.author._id.equals(visitorId)
            post.authorId = undefined
            post.author = {
                username: post.author.username,
                avatar: new User(post.author).getAvatar()
            }
            return post
        })

        resolve(posts)
    })
}

Post.findSingleById = function (postId, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof (postId) != "string" || !ObjectId.isValid(postId)) {
            reject()
            return
        }
        let posts = await Post.reusablePostQuery([
            { $match: { _id: ObjectId(postId) } }
        ], visitorId)

        if (posts.length != 0) {
            resolve(posts[0])
        } else {
            reject("Post not found.")
        }
    })
}

Post.findByAuthorId = function (authorId) {
    return Post.reusablePostQuery([
        { $match: { author: authorId } },
        { $sort: { date: -1 } }
    ])
}

Post.delete = (postId, visitorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postId, visitorId)
            if (post.isVisitorOwner) {
                await postsCollection.deleteOne({_id: ObjectId(postId)})
                resolve()
                return
            } else {
                reject("You do not have permission")
            }
        } catch (e) {
            reject(e)
        }
    })
}

Post.search = (searchTerm) => {
    return new Promise((resolve, reject) => {
        if (typeof(searchTerm) == "string") {
            let posts = Post.reusablePostQuery(
                [{$match: {$text: {$search: searchTerm}}}],
                undefined,
                [{$sort: {score: {$meta: "textScore"}}}]) // "textScore" signifies how well the document matched the search term
            resolve(posts)
        } else {
            reject()
        }
    })
}

Post.getFeed = async (id) => {
    const followedIds = await Follow.findFollowedIdsbyId(id)
    const posts = await Post.reusablePostQuery([
        {$match: {author: {$in: followedIds}}},
        {$sort: {date: -1}}
    ], undefined)
    return posts
}

module.exports = Post