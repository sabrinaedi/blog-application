'use strict'

// require necessary npm packages
const express = require ('express')
const app = express()
const sequelize = require('sequelize')
const session = require('express-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')

// set view engine to pug and default display files from view folder
app.set('view engine', 'pug')
app.set('views', __dirname + '/../views')

// set up bodyParser for the intake of information entered into forms
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//set up static folder for static files
app.use(express.static(__dirname + '/../static'))

// configure session for login 
app.use(session({
	secret: 'this is a secret',
	resave: true,
	saveUninitialized: false
}));

let loginRouter = require(__dirname + '/routes/login')
let newPostRouter = require(__dirname + '/routes/newpost')
let profileRouter = require(__dirname + '/routes/profile')
let postsRouter = require (__dirname + '/routes/posts')
let postRouter = require (__dirname + '/routes/post')
let registerRouter = require(__dirname + '/routes/register')
let searchRouter = require(__dirname + '/routes/search')

app.use('/', loginRouter)
app.use('/', newPostRouter)
app.use('/', profileRouter)
app.use('/', postsRouter)
app.use('/', postRouter)
app.use('/', registerRouter)
app.use('/', searchRouter)

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


// sequelizes synchronizes with postgres database, only then starts listening to the port
// if {force:true}, creates dummie users for programming and debuggin purposes
db.sync().then(db => {
	console.log('db is synced')
//	User.create({
//		name: "test",
//		password: "test",
//		email: "test"
//	}). then( user => {
//		user.createPost({
//			title: "testpost",
//			message: "blablabla"
//		}).then( post => {
//			post.createComment({
//				message: "comment blablablaba"
//			}).then( comment => {
//				comment.setUser( user)
//			})
//		})
//	})

}).then (db => {
	//determine a port
	app.listen(8000, (req, res) => {
		console.log('Server is running')
	})
})

