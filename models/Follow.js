const usersCollection = require("../db").db().collection("users")
const followsCollection = require("../db").db().collection("follows")
const User = require("./User")
const { ObjectId } = require('mongodb')

class Follow {
    constructor(followedUsername, followerId) {
        this.followedUsername = followedUsername
        this.followerId = followerId
        this.cleanUp()
    }

    cleanUp() {
        if (typeof (this.followedUsername) != "string") {
            this.followedUsername = ""
        }
    }

    save() {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            const followedUser = await User.findByUsername(this.followedUsername)
            if (followedUser) {
                if (!await this.exists()) {
                    if (followedUser._id == ObjectId(this.followerId)) {
                        reject("You cannot follow yourself.")
                    } else {
                        await followsCollection.insertOne({ followedId: followedUser._id, followerId: ObjectId(this.followerId) })
                        resolve()
                    }
                } else {
                    reject(`Already following ${this.followedUsername}.`)
                }
            } else {
                reject("Cannot follow as user does not exist.")
            }
        })
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            const followedUser = await User.findByUsername(this.followedUsername)
            if (followedUser) {
                if (await this.exists()) {
                    await followsCollection.deleteOne({ followedId: followedUser._id, followerId: ObjectId(this.followerId) })
                    resolve()
                } else {
                    reject(`Already unfollowed ${this.followedUsername}.`)
                }

            } else {
                reject("Cannot follow as user does not exist.")
            }
        })
    }

    exists() {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            const followedUser = await User.findByUsername(this.followedUsername)
            if (followedUser) {
                const isVisitorFollower = await followsCollection.findOne({ $and: [{ followedId: followedUser._id }, { followerId: ObjectId(this.followerId) }] })
                if (isVisitorFollower) {
                    resolve(true)
                } else {
                    resolve(false)
                }

            } else {
                reject(false)
            }
        })
    }
}

Follow.findFollowersById = async (id) => {
    const followDocs = await followsCollection.aggregate([
        { $match: { followedId: ObjectId(id) } },
        { $lookup: { from: "users", localField: "followerId", foreignField: "_id", as: "followerDocument" }},
        { $project: {  followerId: 1, followedId: 1, followerUser: { $arrayElemAt: ["$followerDocument", 0] } } }
    ]).toArray()
    const followerUsersInfo = followDocs.map(followDoc => {
        const followerUser = new User(followDoc.followerUser)
        return {username: followerUser.username, avatar: followerUser.getAvatar()}
    })
    return followerUsersInfo
}

Follow.findFollowingById = async (id) => {
    const followDocs = await followsCollection.aggregate([
        { $match: { followerId: ObjectId(id) } },
        { $lookup: { from: "users", localField: "followedId", foreignField: "_id", as: "followingDocument" }},
        { $project: {  followerId: 1, followedId: 1, followingUser: { $arrayElemAt: ["$followingDocument", 0] } } }
    ]).toArray()
    const followingUsersInfo = followDocs.map(followingDoc => {
        const followingUser = new User(followingDoc.followingUser)
        return {username: followingUser.username, avatar: followingUser.getAvatar()}
    })
    return followingUsersInfo
}

Follow.findFollowedIdsbyId = async (id) => {
    const follows = await followsCollection.find({followerId: ObjectId(id)}).toArray()
    followedIds = follows.map(docs => docs.followedId)
    return followedIds
}


module.exports = Follow