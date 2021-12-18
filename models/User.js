const usersCollection = require("../db").db().collection("users")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const md5 = require("md5")
const { ObjectId } = require("mongodb")

class User {
    constructor(data) {
        this.username = data.username
        this.email = data.email
        this.password = data.password
        this.errors = []
    }

    cleanUp() {
        // get rid of bogus properties
        if (typeof (this.username) != "string") {
            this.username = ""
        }
        if (typeof (this.email) != "string") {
            this.email = ""
        }
        if (typeof (this.password) != "string") {
            this.password = ""
        }

        this.username.trim().toLowerCase()
        this.email.trim().toLowerCase()
    }

    async validate() {
        if (this.username == "") {
            this.errors.push("You must provide a username.")
        } else {
            if (this.username.length < 3) {
                this.errors.push("Username cannot be less than 3 characters")
            }
            if (this.username.length > 20) {
                this.errors.push("Username cannot exceed 20 characters")
            }
            if (!validator.isAlphanumeric(this.username)) {
                this.errors.push('Username can only contain letters and numbers.')
            }
            // Check if the username is already taken
            if (this.username.length > 3 && this.username.length < 21 && validator.isAlphanumeric(this.username)) {
                const userExists = await usersCollection.findOne({ username: this.username })
                if (userExists) {
                    this.errors.push('Username already exists.')
                }
            }

        }

        if (!validator.isEmail(this.email)) {
            this.errors.push("You must provide a valid email address.")
        } else {
            const emailExists = await usersCollection.findOne({ email: this.email })
            if (emailExists) {
                this.errors.push('Email already in use.')
            }
        }

        if (this.password == "") {
            this.errors.push("You must provide a password.")
        } else if (this.password.length < 12) {
            this.errors.push("Password cannot be less than 12 characters")
        }
        else if (this.password.length > 50) {
            this.errors.push("Password cannot exceed 50 characters")
        }
    }

    register() {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            await this.validate()
            if (this.errors.length == 0) {
                let salt = bcrypt.genSaltSync(10)
                this.password = bcrypt.hashSync(this.password, salt)
                const userDoc = await usersCollection.insertOne(this)
                this.id = userDoc._id
                this.avatar = this.getAvatar()
                resolve()
            } else {
                reject(this.errors)
            }
        })


    }

    login() {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            try {
                const userDoc = await usersCollection.findOne({ username: this.username })
                if (userDoc && bcrypt.compareSync(this.password, userDoc.password)) {
                    this.email = userDoc.email
                    this.id = userDoc._id
                    this.avatar = this.getAvatar()
                    resolve()
                } else {
                    reject("Wrong username or password.")
                }
            } catch (e) {
                reject("Try again later")
            }
        })
    }

    getAvatar() {
        return `https://gravatar.com/avatar/${md5(this.email)}?s=128`
    }
}

User.findByUsername = (username) => {
    return new Promise(async (resolve, reject) => {
        if (typeof(username) != "string") {
            reject("Invalid username")
            return
        }
        let userDoc = await usersCollection.findOne({ username: username })
        if (userDoc) {
            userDoc = {
                _id: userDoc._id,
                username: userDoc.username,
                avatar: new User(userDoc).getAvatar()
            }
            resolve(userDoc)
        } else {
            reject("User does not exist")
        }
    })

}

User.findByEmail = async (email) => {
    if (typeof(email) != "string") return false
    const res = await usersCollection.findOne({ email: email })
    if (res) return true
}

module.exports = User