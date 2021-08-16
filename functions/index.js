const functions = require("firebase-functions");
const express = require('express')
const cors = require('cors')
const { userSignUp, userLogin } = require('./src/users')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/signup', userSignUp)
app.post('/login', userLogin)


exports.app = functions.https.onRequest(app)