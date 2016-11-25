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

// route that displays a page with a search fomr to look for specific users' posts
router.get('/search', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.send ('To use the search function, please log in or sign up')
	}
	else {
		res.render('search')
	}
})

// route that takes in the user input from the searchbar and searches for corresponding posts
router.post('/searchUser', (req, res) => {
	User.findOne ({
		where: {
			name: req.body.inputSearch 
		}
	}). then ( user  => {
		Post.findAll({
			where: {
				userId: user.id
			},
			include: [User]
		}).then ( post => {
			res.render('search', {data: post})
		})
	})
})

module.exports = router