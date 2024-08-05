var db = require('../external_functions/dbFunctions');
var websocketfunc = require("./websocket_functions")
const util = require("../../util/utils");


module.exports = { 
    vote_get: vote_get
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


