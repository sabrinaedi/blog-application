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

// route to display form to register as new user
router.get('/users/new', (req, res) => {
	let message = decodeURIComponent(req.query.message)
	console.log(message)
	res.render('register', {data: message})
})

// action to register as a new user, redirect to profile
router.post('/users', (req, res) => {
	if (req.body.inputPassword.length>7 && req.body.inputName.length>0) {
		User.count ( {
			where: sequelize.or(
				{ email: req.body.inputEmail},
				{ name: req.body.inputName }
			)
		} ).then( num => {
			if ( num > 0 ) {
				res.redirect('/users/new?message=' + encodeURIComponent("username or email already exists"))
			} else {
				bcrypt.hash(req.body.inputPassword, null, null, (err, hash) => {
					User.create({
						name: req.body.inputName,
						email: req.body.inputEmail,
						password: hash
					}).then (user => {  
						req.session.user = user
					}).then (user => {
						res.redirect('/profile')
					})
				})
			}
		})
	}
})

module.exports = router