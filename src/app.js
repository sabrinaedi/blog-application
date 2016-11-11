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



//testroute to check if connection works
app.get('/ping', (req, res) => {
	res.send('Pong')
}) 

// route for index page, displaying all posts (including attributed User)
app.get('/', (req, res) => {
	console.log('index is running')
	Post.findAll ( {
		include: [{
			model: User,
			attributes: ['name']
		}]
	})
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
	}).then (user => {  
		req.session.user = user
	}).then (user => {
	res.redirect('/profile')
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
	res.render('newpost')
})

// route that creates a new post in the database tables
app.post('/posts', (req, res) => {
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

//route to display details of a post and comment page
app.get('/viewpost', (req, res) => {
	console.log(req.query.id)
	req.session.postid = req.query.id
	Post.findOne({
		where: {
			id: req.query.id
		}
	}).then ( post => {
		console.log(post)
		res.render('post', {
			data: post
		})
	})
	
})

// route to add a new comment
app.post('/comment', (req, res) => {
	User.findOne({
		where: {
			email: req.session.user.email
		}
	}).then ( user => {
		console.log('CHECK THIS OUT')
		console.log(user)
		user.createComment({
			postId: req.session.postid,
			message: req.body.inputComment
		})

	}).then (comment => {
		res.redirect('/')
	})
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

