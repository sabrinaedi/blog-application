'use strict'

// require necessary npm packages
const express = require ('express')
const app = express()
const sequelize = require('sequelize')
const session = require('express-session')
const bodyParser = require('body-parser')

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

//connect to database
let db = new sequelize('blog_app', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

//define database structure

//define models

let User = db.define('users', {
	name: sequelize.STRING,
	email: {type: sequelize.STRING, unique: true},
	password: sequelize.STRING
})

let Post = db.define('posts', {
	name: sequelize.STRING,
	title: sequelize.STRING,
	message: sequelize.STRING
})

let Comment = db.define('comments', {
	name: sequelize.STRING,
	title: sequelize.STRING,
	message: sequelize.STRING
})


//define relations

User.hasMany(Post)
User.hasMany(Comment)
Post.belongsTo(User)
Comment.belongsTo(User)
Post.hasMany(Comment)
Comment.belongsTo(Post)



//testroute to check if connection works
app.get('/ping', (req, res) => {
	res.send('Pong')
}) 

// route for index page, displaying all posts
app.get('/', (req, res) => {
	console.log('index is running')
	Post.findAll ()
	.then(posts => {
		res.render('index', {
			data: posts
		})
	})
})

app.get('/login', (req, res) => {
	res.render('login')
})

// route to display form to register as new user
app.get('/users/new', (req, res) => {
	res.render('register')
})

// action to register as a new user, redirect to profile
app.post('/users', (req, res) => {
	User.create({
		name: req.body.inputName,
		email: req.body.inputEmail,
		password: req.body.inputPassword
	}).then(user => {
		user.createPost({
		})
	})
	res.redirect('/profile', {
	})
})

// temporary route for displaying all users for test purposes
app.get('/users', (req, res) => {
	User.findAll ()
	.then(users => {
		res.send(users)
	})
})

// route to show user profile
app.get('/profile', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.redirect('/')
	} else {
		res.render('profile', {
			data: user
		})
	}
})

// route for user login (start session)
app.post('/login', (req, res) => {
	User.findOne({
		where: {
			email: req.body.loginEmail
		}
	}).then ( (user) => {
		console.log(user)
			if (user !== null && req.body.loginPassword == user.password) {
				req.session.user = user
				res.redirect('/profile')
				(console.log('found match'))
			} else {
				console.log('found no match')
				res.redirect('/')
			}
		}), (error) => {
			console.log('there was some other error')
			res.redirect('/')
		}
})

// route to display form to create new post
app.get('/posts/new', (req, res) => {
	res.render('post')
})

// route that creates a new post in the database tables
app.post('/posts', (req, res) => {
	Post.create({
		title: req.body.inputTitle,
		message: req.body.inputMessage
	})
	res.redirect('/')
})

// sequelizes synchronizes with postgres database, only then starts listening to the port
db.sync().then(db => {
	console.log('db is synced')
}).then (db => {
	//determine a port
	app.listen(8000, (req, res) => {
		console.log('Server is running')
	})
})

