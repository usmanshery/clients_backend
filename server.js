const dotenv = require('dotenv');
dotenv.config();

if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

// const videoRouter = require('./routes/videoRouter');
const clientRouter = require('./routes/clientRouter');
const campaignRouter = require('./routes/campaignRouter');
const session = require('express-session');

const port = 5000;
const app = express();

var corsOptions = {
	origin: 'http://clients.patronish.com',
	optionsSuccessStatus: 200,
	credentials: true
}

app.use(cors(corsOptions));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	cookie: { maxAge: 60*60*1000 },  // 1 hour
	saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use('/users', clientRouter);
app.use('/campaigns', campaignRouter);

function init(){
	app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
}

init();