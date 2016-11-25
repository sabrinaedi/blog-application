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

// route to display form to create new post
router.get('/posts/new', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.send('Please log in to add a post')
	} else {
		res.render('newpost')
	}
})

// route that creates a new post in the database tables
router.post('/posts', (req, res) => {
	User.findOne({
		where: {
			email: req.session.user.email
		}
	}). then (user => {
		user.createPost({	
			title: req.body.inputTitle,
			message: req.body.inputMessage,
		})
	}). then (user => {
		res.redirect('/')
	})
})


module.exports = router