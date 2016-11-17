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


// route for index page, displaying all posts (including attributed User)
app.get('/', (req, res) => {
	console.log('index is running')
	
	let user = req.session.user

	Post.findAll ( {
		include: [{
			model: User,
			attributes: ['name']
		}]
	})
	.then(posts => {
		res.render('index', {
			data: posts,
			user: user
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
	bcrypt.hash(req.body.inputPassword, null, null, function(err, hash) {
	   	User.create({
			name: req.body.inputName,
			email: req.body.inputEmail,
			password: hash
		}).then (user => {  
			req.session.user = user
		}).then (user => {
			res.redirect('/profile')
		})
	});
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
app.post('/login/user', (req, res) => {
	User.findOne({
		where: {
			email: req.body.loginEmail
		}
	}).then ( (user) => {
		console.log('LOOK AT THIS USER:         ')
		console.log(user)
		console.log(req.body.loginPassword)
		bcrypt.compare(req.body.loginPassword.toString(), user.password, (err, result) => {
			console.log('THIS IS THE RESULT    ')
			console.log(result)
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
app.get('/logout', (req, res) => {
	console.log("was logged out")
	delete req.session.user
	res.redirect('/')
})

// route to display form to create new post
app.get('/posts/new', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.send('Please log in to add a post')
	} else {
	res.render('newpost')
	}
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
	let user = req.session.user
	if (user == undefined) {
		res.send('Please log in or sign up to see and add comments')
	} else {
		console.log(req.query.id)
		req.session.postid = req.query.id
		Post.findOne({
			where: {
				id: req.query.id
			},
			include: [{model: User},{model: Comment, include: [User]}]
		}).then ( post => {
			console.log(post)
			res.render('post', {
				data: post
			})
		})
	}
})

// route to add a new comment
app.post('/comment', (req, res) => {
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
			} )
		})
	}).then (comment => {
		res.redirect('/viewpost')
	})
})

// route that displays a page with a search fomr to look for specific users' posts
app.get('/search', (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.send ('To use the search function, please log in or sign up')
	}
	else {
		res.render('search')
	}
})

// route that takes in the user input from the searchbar and searches for corresponding posts
app.post('/searchUser', (req, res) => {
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


// sequelizes synchronizes with postgres database, only then starts listening to the port
// creates dummie users for programming and debuggin purposes when force is made true
db.sync().then(db => {
	console.log('db is synced')
	User.create({
		name: "test",
		password: "test",
		email: "test"
	}). then( user => {
		user.createPost({
			title: "testpost",
			message: "blablabla"
		}).then( post => {
			post.createComment({
				message: "comment blablablaba"
			}).then( comment => {
				comment.setUser( user)
			})
		})
	})

}).then (db => {
	//determine a port
	app.listen(8000, (req, res) => {
		console.log('Server is running')
	})
})

