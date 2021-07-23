const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { handler: errorHandler } = require('./middlewares/error');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const toDoRouter = require('./routes/toDo');
const userRouter = require('./routes/user');
const journeyRouter = require('./routes/journey');
const retrospectRouter = require('./routes/retrospect');
const homeRouter = require('./routes/home');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth/v0', authRouter.v0.router);
app.use('/toDo/v0', toDoRouter.v0.router);
app.use('/user/v0', userRouter.v0.router);
app.use('/journey/v0', journeyRouter.v0.router);
app.use('/retrospect/v0', retrospectRouter.v0.router);
app.use('/home/v0', homeRouter.v0.router);

app.use(errorHandler);

module.exports = app;
