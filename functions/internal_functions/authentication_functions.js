var db = require('../external_functions/dbFunctions');
const util = require("../../util/utils");
const bcrypt = require('bcrypt');



module.exports = { 
    login_get:login_get,
    logout_post: logout_post,
    register_post: register_post
}


function login_get(req, res){
    res.render('login_page', {
        is_authed: req.isAuthenticated()
    });
}

function logout_post(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/vote');
    });
}

async function register_post(req, res){

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
}


function generateUserID(){
    var rand_number = Math.floor(Math.random() * 1_000_000_000)
    var date = Date.now().toString();
    var rand_date = date * rand_number; 
    var cropped = rand_date.toString().slice(2,15)
    var id =    Number(cropped);
    return id;
}