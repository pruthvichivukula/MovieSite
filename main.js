require('dotenv').config()
//console.log(process.env) // remove this after you've confirmed it is working
//const env = require('./env')


var http = require('http');
var dt = require('./util/datetimeModule');
var db = require('./functions/external_functions/dbFunctions');
const indfunc = require("./index_page_functions");
const tmdbfunc = require("./functions/external_functions/tmdb_functions")

const authfunc = require("./functions/internal_functions/authentication_functions")
const moviesitefunc = require("./functions/internal_functions/movie_site_functions")
const websocketfunc = require("./functions/internal_functions/websocket_functions")


const util = require("./util/utils");

const express = require('express');
var multer = require('multer');
var upload = multer();
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')


const app = express();
var path = require('path');
const port = 8080;

app.set('view engine', 'ejs');
app.set('views','./views');

app.use(express.json());    // for parsing application/xwww-
app.use(express.urlencoded({ extended: true })); //form-urlencoded

//auth
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const s = app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

//***************** Websocket CODE *****************
const WebSocket = require('ws');

websocketfunc.initialize_websocket(s)
//const wss = new WebSocket.Server({ server: s });


app.get('/refresh_test', function(req, res){
    res.render('refresh_test')
});

app.get('/refresh_test_2', function(req, res){
    wss.clients.forEach(function each(client) {
        client.send('message sent by loading page 2');
 });
    res.send("test");
});



//***************** AUTHENTICATION CODE *****************

const initializePassport = require('./passport-config');
const e = require('express');
const { VOTE_FOR } = require('./util/vote_enum');
const vote_enum = require('./util/vote_enum');

initializePassport(
    passport,
    //username => users.find(user => user.username === username),
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

app.get('/login', authfunc.login_get);

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/vote', 
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/logout', authfunc.logout_post);

app.get('/register', checkNotAuthenticated, function(req, res){
    res.render('register_page');
});

app.post('/register', authfunc.register_post);

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/vote')
    }
    next()
}

//***************** MOVIE SITE CODE *****************

app.get('/vote', moviesitefunc.vote_get);

app.post('/select_movie', moviesitefunc.selectmovie_post);

app.get('/search', moviesitefunc.search_get);

app.post('/search', moviesitefunc.search_post);

//*********** MOVIE SITE AJAX CALLS CODE ***********

app.post('/ajax_votes', async function(req, res){
    var body_json = JSON.parse(JSON.stringify(req.body))
    console.log(body_json);
    var button_info = JSON.parse(body_json.button.toString());
    var user_vote_text = button_info.vote;
    var movie_id = button_info.movie_id; 
    if(req.isAuthenticated()){
        var username = req.user.username;
        var user_vote = await db.get_vote(req.user.user_id, username, movie_id, user_vote_text);
        console.log(user_vote);
        //if(util.isEmpty(user_vote)){
            await db.add_change_vote(req.user.user_id, username, movie_id, user_vote_text);
            var vote_count = await db.update_vote_count(movie_id);
        //}
        res.send(vote_count);
        //res.send("hello, " + username + ". you clicked the button: " + user_vote_text + movie_id);

    }
    else{ 
        res.send("Not logged in. <a href='/login'>Log in to vote.</a>")
    }

});

/*
app.get('/ajax_test', function(req, res){
    res.render('ajax_test')
});
*/

app.get('/is_authed', function(req, res){
    var authed = {'authed': req.isAuthenticated()}
    res.send(authed);
})

app.get('/test_page_ext_function', function(req, res){
    indfunc.test_page(req, res);
});
