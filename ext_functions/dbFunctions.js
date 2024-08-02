require('dotenv').config()

var mysql = require('mysql');
var vote_type = require('../util/vote_enum');
const util = require("../util/utils");

var db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  };

/*con = mysql.createConnection(db_config);

con.connect(function(err) {
if (err) throw err;
con.query("SELECT * FROM movielist", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    if (!util.isEmpty(result)){
        console.log(result[0].title);
    }
    return(result);
});
});*/

function handleDisconnect() {
    con = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    con.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
      con.query("SELECT * FROM movielist", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        if (!util.isEmpty(result)){
            console.log(result[0].title);
        }
        return(result);
    });
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    con.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();


function query_db(query, args) {
    return new Promise((resolve, reject) =>{
        try{
            con.query(query, args, function (err, result) {
                if (err){
                    return reject(err)
                }
                
                return resolve(result)
            });
        }
        catch(e){
            reject(e)
        }
    })
};

async function get_all_movies(sortby) {

    if (sortby == "top"){
        var sql_query = "SELECT * FROM movielist ORDER BY score DESC;";
    } else if (sortby == "bottom"){
        var sql_query = "SELECT * FROM movielist ORDER BY score;";
    } else if (sortby == "newest"){
        var sql_query = "SELECT * FROM movielist ORDER BY date_added DESC;";
    } else if (sortby == "oldest"){
        var sql_query = "SELECT * FROM movielist ORDER BY date_added;";
    } else{
        var sql_query = "SELECT * FROM movielist;";
    }

    try{
        const movie_list = await query_db(sql_query);
        console.log(movie_list);
        return movie_list;
    }
    catch(e){
        console.error(e)
        return res.status(500).send({
            success: false,
            message: 'internal server error'
        })
    }
}


async function check_if_movie_exists_by_id(movie_id) {
    var sql_query = "SELECT * FROM movielist WHERE tmdb_id = ?";// + mysql.escape(movie_id);

    try{
        const movie_list = await query_db(sql_query, [movie_id]);
        console.log(movie_list);
        return movie_list;
    }
    catch(e){
        console.error(e)
        return res.status(500).send({
            success: false,
            message: 'internal server error'
        })
    }
}

async function add_movie(movie, adder){
    console.log(movie);

    var movie_for_args = [movie.id, movie.title, movie.overview, movie.poster_path, movie.release_date, adder, 0, 0, 0 ]; // TODO
    var sql_query = "INSERT INTO MovieList (tmdb_id, title, overview, poster_path, release_date, date_added, adder, vote_for, vote_against, vote_abstain) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ? )";
    console.log(sql_query);
    try{
        const movie_list = await query_db(sql_query, movie_for_args);
        console.log(movie_list);
        return movie_list;
    }
    catch(e){
        console.error(e)
        throw e;
    }
}
//******************* Voting ******************

async function get_all_votes_for_user(user_id, username){
    console.log("getting vote for:" + username);

    //if (vote_type.isValidVote(vote)){
        var movie_for_args = [user_id, username]; // TODO
        var sql_query = "SELECT * FROM votes WHERE user_id = ? and username = ? ;"
        console.log(sql_query);
        try{
            const movie_list = await query_db(sql_query, movie_for_args);
            console.log(movie_list);
            return movie_list;
        }
        catch(e){
            console.error(e)
            throw e;
        }
    //}    
}

async function get_vote(user_id, username, movie_id, vote){
    console.log("getting vote for:" + username + movie_id + vote);

    if (vote_type.isValidVote(vote)){
        var movie_for_args = [user_id, username, movie_id]; // TODO
        var sql_query = "SELECT * FROM votes WHERE user_id = ? and username = ? and movie_id = ? ;"
        console.log(sql_query);
        try{
            const movie_list = await query_db(sql_query, movie_for_args);
            console.log(movie_list);
            return movie_list;
        }
        catch(e){
            console.error(e)
            throw e;
        }
    }    
}

async function add_change_vote(user_id, username, movie_id, vote){
    console.log(username + movie_id + vote);
    if (vote_type.isValidVote(vote)){
        var user_vote = await get_vote(user_id, username, movie_id, vote);
        if (util.isEmpty(user_vote)){
            var movie_for_args = [user_id, username, movie_id, vote]; // TODO
            var sql_query = "INSERT INTO votes (user_id, username, movie_id, vote_type ) VALUES ( ?, ?, ?, ? )";
            console.log(sql_query);
            try{
                const movie_list = await query_db(sql_query, movie_for_args);
                console.log(movie_list);
                return movie_list;
            }
            catch(e){
                console.error(e)
                throw e;
            }
        }
        else {
            var movie_for_args = [vote, user_id, username, movie_id]; // TODO
            var sql_query = "UPDATE votes SET vote_type = ?  WHERE user_id = ? and username = ? and movie_id = ? ;";
            console.log(sql_query);
            try{
                const movie_list = await query_db(sql_query, movie_for_args);
                console.log(movie_list);
                return movie_list;
            }
            catch(e){
                console.error(e)
                throw e;
            }
        }
    }    
}

// **** vote counts ****

async function get_score_for_movie(movie_id) {
    var movie_for_args = [movie_id]; // TODO
    var sql_query = "SELECT score FROM movielist WHERE tmdb_id = ? ;";

    try{
        const movie_list = await query_db(sql_query, movie_for_args);
        console.log(movie_list);
        return movie_list;
    }
    catch(e){
        console.error(e)
        return res.status(500).send({
            success: false,
            message: 'internal server error'
        })
    }
}

async function get_vote_count_by_vote(movie_id, vote) {
    var movie_for_args = [movie_id, vote]; // TODO
    var sql_query = "SELECT COUNT(*) AS VOTE_COUNT FROM votes WHERE movie_id = ? AND vote_type = ?;";

    try{
        const movie_list = await query_db(sql_query, movie_for_args);
        console.log(movie_list);
        return movie_list;
    }
    catch(e){
        console.error(e)
        return res.status(500).send({
            success: false,
            message: 'internal server error'
        })
    }
}

async function get_vote_count_for_movie(movie_id) {
    var vote_count_for = await get_vote_count_by_vote(movie_id, vote_type.VOTE_FOR);
    var vote_count_abstain = await get_vote_count_by_vote(movie_id, vote_type.VOTE_ABSTAIN);
    var vote_count_agaisnt = await get_vote_count_by_vote(movie_id, vote_type.VOTE_AGAINST);

    return {"vote_count_for": vote_count_for[0].VOTE_COUNT, 
            "vote_count_abstain": vote_count_abstain[0].VOTE_COUNT, 
            "vote_count_against": vote_count_agaisnt[0].VOTE_COUNT};
}


async function update_vote_count(movie_id){
    var vote_count_for_movie = await get_vote_count_for_movie(movie_id)
    var movie_for_args = [vote_count_for_movie.vote_count_for, vote_count_for_movie.vote_count_abstain, vote_count_for_movie.vote_count_against, movie_id]; // TODO
    var sql_query = "UPDATE movielist SET vote_for = ? , vote_abstain = ? , vote_against = ? WHERE tmdb_id = ?;";

    try{
        const movie_list = await query_db(sql_query, movie_for_args);
        console.log(movie_list);
        var score = await get_score_for_movie(movie_id);
        vote_count_for_movie.score = score[0].score;
        return vote_count_for_movie;
    }
    catch(e){
        console.error(e)
        return res.status(500).send({
            success: false,
            message: 'internal server error'
        })
    }
}

//*******************Authentication *******************

async function create_user(user_id, username, password){
    console.log(username);

    var sql_query = "INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)";
    console.log(sql_query);
    try{
        const user = await query_db(sql_query, [user_id, username, password]);
        console.log(user);
        return user;
    }
    catch(e){
        console.error(e)
        throw e;
    }
} 

async function get_user_by_username(username){
    console.log(username);

    var sql_query = "SELECT * FROM users WHERE username = ?";
    console.log(sql_query);
    try{
        const user = await query_db(sql_query, [username]);
        console.log(user);
        return user;
    }
    catch(e){
        console.error(e)
        throw e;
    }
}

async function get_user_by_id(id){
    console.log(id);

    var sql_query = "SELECT * FROM users WHERE user_id = ?";
    console.log(sql_query);
    try{
        const user = await query_db(sql_query, [id]);
        console.log(user);
        return user;
    }
    catch(e){
        console.error(e)
        throw e;
    }
}



module.exports = { 
    query_db: query_db,
    get_all_movies: get_all_movies,
    check_if_movie_exists_by_id: check_if_movie_exists_by_id,
    add_movie: add_movie,
    get_user_by_username: get_user_by_username,
    get_user_by_id: get_user_by_id,
    create_user: create_user,
    get_vote: get_vote,
    add_change_vote: add_change_vote,
    get_all_votes_for_user: get_all_votes_for_user,
    get_vote_count_for_movie: get_vote_count_for_movie,
    update_vote_count: update_vote_count
  }; 


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

/*
exports.select_all_movies = function () {
    var promise = new Promise( function(resolve, reject) {
        var ret_result = 'result'; 
        con.query("SELECT * FROM movielist", function (err, result, fields) {
            if (err) {
                return reject(err);
            }
            console.log(result);
            //return result;
            ret_result = result;
            resolve(result);
        });
        }
    );
    
    var ret_rows;
    
    promise.then(function(rows) {
        console.log(rows);
        ret_rows = rows;
    }).catch((err) => setImmediate(() => { throw err; })); 

    console.log(ret_rows);

   
};
*/
