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

// route for index page
app.get('/', (req, res) => {
	console.log('index is running')
	res.render('index')
})

app.get('/users/new', (req, res) => {
	res.render('register')
})

app.post('/users', (req, res) => {
	User.create({
		name: req.body.inputName,
		email: req.body.inputEmail
	})
})

// sequelizes synchronizes with postgres database, only then starts listening to the port
db.sync({force:true}).then(db => {
	console.log('db is synced')
}).then (db => {
	//determine a port
	app.listen(8000, (req, res) => {
		console.log('Server is running')
	})
})

