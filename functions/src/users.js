const admin = require('firebase-admin')
const jwt = require('jsonwebtoken')
const creds = require('../credentials.json')
const {secret} = require('../secrets')

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
        .add(req.body) 
        .then(() => {
            const token = jwt.sign({
                email: req.body.email
            }, secret)
            res.send({
                message: "User created successfully",
                status: 200,
                success: true,
                token
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
    if(!req.body || !req.body.email || !req.body.password) {
        res.status(400).send({
            message: "Invalid Request: missing email or password",
            status: 400,
            success: false
        })
        return
    }
    const db = connectDb()
    db.collection('users')
        .where('email', '==', req.body.email.toLowerCase())
        .where('password', '==', req.body.password)
        .get()
        .then(userCollection => {
            if(userCollection.docs.length) {
                let user = userCollection.docs[0].data()
                user.password = undefined
                const token = jwt.sign(user, secret)
                res.send({
                    message: 'User loggin in successfully',
                    status: 200,
                    success: true,
                    token
                })
            } else {
                res.status(401).send({
                    message: 'Invalid email or password',
                    status: 401,
                    success: false
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: 'Error: ' + err.message,
                status: 500,
                success: false
            })
        })

}

exports.updateUser = (req, res) => {
    const bearer = req.headers['authorization']
    if(!bearer) {
        req.status(403)
        .send({
            success: false,
            status: 403,
            message: 'Access denied: no token provided'
        })
    }
    const token = bearer.split(' ')[1]
    const decoded = jwt.verify(token, secret)
    console.log(decoded)
    const db = connectDb()
    db.collection('users').where('email', '==', decoded.email).get()
    .then(collection => {
        const userId = collection.docs[0].id
        db.collection('users').doc(userId).update(req.body)
            .then(docRef => {
                res.send({
                    success: true,
                    status: 202,
                    message: 'User updated successfully'
                })
            })
    })
    .catch(err => {
        res.status(500).send({
            success: false,
            status: 500,
            message: 'Server Error: Failed to update user profile'
        })
    })
}