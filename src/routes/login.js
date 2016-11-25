'use strict'

// require necessary npm packages
const express = require ('express')
const app = express()
const sequelize = require('sequelize')
const session = require('express-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const router = express.Router()

//connect to database
let db = new sequelize('blog_app', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

//define database structure

//define models

let User = db.define('users', {
	name: {
		type: sequelize.STRING, 
		allowNull: false,
		unique: true,
		validate: {
			len: [3, 20]
		}
	},
	email: {
		type: sequelize.STRING, 
		allowNull: false,
		unique: true,
	},
	password: sequelize.STRING,
})

let Post = db.define('posts', {
	title: sequelize.STRING,
	message: sequelize.STRING
})

let Comment = db.define('comments', {
	message: sequelize.STRING
})

//define relations

User.hasMany(Post)
User.hasMany(Comment)
Post.belongsTo(User)
Comment.belongsTo(User)
Post.hasMany(Comment)
Comment.belongsTo(Post)

// route to get login page
router.get('/login', (req, res) => {
	res.render('login')
})

// route for user login (start session)
router.post('/login/user', (req, res) => {
	User.findOne({
		where: {
			email: req.body.loginEmail
		}
	}).then ( (user) => {
		bcrypt.compare(req.body.loginPassword.toString(), user.password, (err, result) => {
			if (user !== null && result == true) {
				req.session.user = user
				res.redirect('/profile')
				console.log('found match')
			} else {
				console.log('found no match')
				res.send('Invalid email or password')
			}
		}), (error) => {
			console.log('there was some other error')
			res.send('ERROR')
		}
	})
})

// route for logout function
router.get('/logout', (req, res) => {
	console.log('was logged out')
	delete req.session.user
	res.redirect('/')
})

module.exports = router