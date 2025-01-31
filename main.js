require('dotenv').config()
//console.log(process.env) // remove this after you've confirmed it is working
//const env = require('./env')


var http = require('http');
var dt = require('./util/datetimeModule');
var db = require('./ext_functions/dbFunctions');
const indfunc = require("./index_page_functions");
const tmdbfunc = require("./ext_functions/tmdb_functions")
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
    console.log(`Example app listening on port ${port}`)
})

//***************** Websocket CODE *****************
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server: s });

wss.on("connection", function connection(ws) {
    
    ws.on("message", function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
            console.log("received: %s", data);
            client.send(data, { binary: isBinary });
     });

    });
    ws.send("something");
});

app.get('/refresh_test', function(req, res){
    res.render('refresh_test')
});

app.get('/refresh_test_2', function(req, res){
    wss.clients.forEach(function each(client) {
        client.send('message sent by loading page 2');
 });
    res.send("test");
});

function update_votes(votes){
    wss.clients.forEach(function each(client) {
        client.send(votes.toString());
 });
}


//***************** AUTHENTICATION CODE *****************

function generateUserID(){
    var rand_number = Math.floor(Math.random() * 1_000_000_000)
    var date = Date.now().toString();
    var rand_date = date * rand_number; 
    var cropped = rand_date.toString().slice(2,15)
    var id =    Number(cropped);
    return id;
}

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

app.get('/login', function(req, res){
    res.render('login_page', {
        is_authed: req.isAuthenticated()
    });
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/vote', 
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/logout', function (req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/vote');
    });
    //res.redirect('/vote');
});


app.get('/register', checkNotAuthenticated, function(req, res){
    res.render('register_page');
});

app.post('/register', async function(req, res){

    try{
        users = await db.get_user_by_username(req.body.username);
        console.log(users);
        if(!util.isEmpty(users)){
            var find_user = users.find(user => user.username === req.body.username);
            console.log(find_user);
            if (util.isEmpty(find_user)){
                console.log("No user with that username. Adding user");
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                await db.create_user(generateUserID(), req.body.username, hashedPassword);
            } else {
                console.log("User already exists with that username");
                req.flash("error", "User already exists with that username");
                res.redirect('/register');
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await db.create_user(generateUserID(), req.body.username, hashedPassword);
            req.flash("info", "Registration Successful");
            res.redirect('/login');
        }
    } catch(e) {
        console.error(e);
    }

    //res.send( users );
});

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/vote')
    }
    next()
}

//***************** MOVIE SITE CODE *****************

app.get('/vote', async function(req, res){

    if(!!req.query.sortby){
        console.log(req.query.sortby);
    }
    else{
        console.log("no sort by");
    }

    const movie_list = await db.get_all_movies(req.query.sortby);
    console.log(movie_list);

    var is_authed = req.isAuthenticated();
    var username_req = '';
    var userid_req = '';
    var user_votes = '';
    try{
        if (is_authed){
            username_req = req.user.username; 
            userid_req = req.user.user_id;
            var user_votes_db = await db.get_all_votes_for_user(userid_req, username_req);
            user_votes = util.make_vote_json(user_votes_db);
            console.log(user_votes);
        }
        var votecount = await db.get_vote_count_for_movie("568");
        console.log(votecount);
        update_votes(votecount);
        await db.update_vote_count("568");
    }catch(e) {
        console.error(e);
    }
    res.render('voting_page', {
        movie_list: movie_list,
        is_authed: is_authed,
        username: username_req,
        userid: userid_req,
        user_votes: user_votes
    });

});

app.post('/select_movie', async function(req, res){

    var movie = JSON.parse(req.body.select_movie);
    try{
            const movie_if_exists = await db.check_if_movie_exists_by_id(movie.id);

            console.log(movie_if_exists);

            if (util.isEmpty(movie_if_exists)){
                //res.send("Movie not in db, adding to db");
                const add_movie = await db.add_movie(movie, req.user.username);
                res.redirect('/vote');
            }
            else {
                //res.send("Movie already in db");
                res.redirect('/search');
            }
            
    }
    catch(e){
            console.error(e)
            return res.status(500).send({
                    success: false,
                    message: 'internal server error'
            })
    }
});

app.get('/search', async function(req, res) {
    
    var is_authed = req.isAuthenticated();
    var username_req = '';
    var userid_req = '';

    try{
        if (is_authed){
            username_req = req.user.username; 
            userid_req = req.user.user_id;
        }
    }catch(e) {
        console.error(e);
    }

    res.render('search_page', {
        search_results: req.body,
        is_authed: is_authed,
        username: username_req,
        userid: userid_req
    });


});


app.post('/search', async function(req, res) {
    console.log(req.body);
    tmdbfunc.asyncSearchMovies(req.body['search_text']).then(search_results => {
        console.log(search_results);

        var s_r_copy = JSON.parse(search_results);

        var is_authed = req.isAuthenticated();
        var username_req = '';
        var userid_req = '';

        try{
            if (is_authed){
                username_req = req.user.username; 
                userid_req = req.user.user_id;
            }
        }catch(e) {
            console.error(e);
        }

        res.render('search_page', {
            search_results: s_r_copy,
            is_authed: is_authed,
            username: username_req,
            userid: userid_req
        });

    });

});

/*
function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}
*/


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
