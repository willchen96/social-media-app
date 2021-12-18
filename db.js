const mongodb = require("mongodb").MongoClient
const dotenv = require("dotenv")
dotenv.config()

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) =>  {
        module.exports = client
        const app = require("./app")
        app.listen(process.env.PORT, () => console.log('Connected'))
    }).catch(e => console.log(e))