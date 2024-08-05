var db = require('../external_functions/dbFunctions');
var websocketfunc = require("./websocket_functions")
const util = require("../../util/utils");


module.exports = { 
    vote_get: vote_get,
    selectmovie_post: selectmovie_post,
    search_get: search_get,
    search_post: search_post
}



async function vote_get(req, res){

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
        websocketfunc.update_votes(votecount);
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

}


async function selectmovie_post(req, res){

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
}


async function search_get(req, res) {
    
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
}

async function search_post(req, res) {
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

}