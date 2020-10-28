const express = require('express');
const path = require('path');
const cookiSession = require('cookie-session');
const createError = require('http-errors');

const bodyParser = require('body-parser');

const FeedbackServices = require('./services/FeedbackService');
const SpeakersServices = require('./services/SpeakerService');

const feedbackService = new FeedbackServices('./data/feedback.json');
const speakersService = new SpeakersServices('./data/speakers.json');

const routes = require('./routes');

const app =express();

const port= 3000;

app.set('trust proxy', 1);

app.use(cookiSession({
    name: 'session',
    keys: ['ghvh123','adnb b12313'],
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'./views'));

app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static')));

app.use(async (req,res, next) =>{

    try{
        const names = await speakersService.getNames();
        res.locals.speakerNames = names;
        return next();
    }catch (err) {
        return next(err);
    }
});

app.use('/', routes({
    feedbackService,
    speakersService,
}));

app.use((req,res,next) => {
    return next(createError(404 , ' File not found'));
});

app.use((err,req,res,next) => {
    res.locals.message = err.message;
    console.error(err);
    const status = err.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

app.listen(port, () =>{
    console.log(`Express server is listening on port ${port} !`);
});