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

//route to display details of a post and comment page
router.get('/viewpost', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.send('Please log in or sign up to see and add comments')
	} else {
		req.session.postid = req.query.id
		Post.findOne({
			where: {
				id: req.query.id
			},
			include: [{model: User},{model: Comment, include: [User]}]
		}).then ( post => {
			res.render('post', {
				data: post
			})
		})
	}
})

// route to add a new comment
router.post('/comment', (req, res) => {
	User.findOne({
		where: {
			email: req.session.user.email
		}
	}).then ( user => {
		Post.findOne({
			where: {
				id: req.session.postid
			}
		}).then ( post => {
			post.createComment({
				message: req.body.inputComment
			}).then( comment => {
				comment.setUser(user)
				req.query.id = post.id
				res.redirect('/viewpost?id=' + req.query.id)
			})
		})
	})
})

module.exports = router