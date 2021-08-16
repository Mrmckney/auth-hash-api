const admin = require('firebase-admin')
const creds = require('../credentials.json')

function connectDb() {
    if(!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(creds)
        })
    }
    return admin.firestore()
}


exports.userSignUp = (req, res) => {
    if(!req.body || !req.body.email || !req.body.password) {
        res.status(400).send({
            message: "Invalid Request: missing email or password",
            status: 400,
            success: false
        })
    }
    const db = connectDb()
    db.collection('users')
        .doc(req.body.email.toLowerCase())
        .set(req.body) 
        .then(() => {
            res.send({
                message: "User created successfully",
                status: 200,
                success: true
            })
        })
        .catch(err => {
            res.status(500).send({
                message: "Error: " + err.message,
                status: 500,
                success: false
            })
        })
}

exports.userLogin = (req, res) => {
    res.send('ok')

}