var vote_type = require('../util/vote_enum');



module.exports = {
    isEmpty: isEmpty,
    get_button_info: get_button_info,
    make_vote_json: make_vote_json
}

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
}


function get_button_info(button_info){
  var split_info = button_info.split("_");
  var vote = split_info[1].toString().toUpperCase();
  var movie_id = split_info[2]


  return {vote: vote, movie_id: movie_id};
}


function make_vote_json(user_votes){
  console.log(user_votes)
  var votes_json = {};
  for (var i = 0; i < user_votes.length; i++){
    votes_json[user_votes[i].movie_id] = make_vote_sub_json(user_votes[i].vote_type)
  }
  console.log(votes_json);
  return votes_json;
}

function make_vote_sub_json(vote_button){
  if (vote_button == 'FOR') {
      return {'FOR': 'voted', 'ABSTAIN': '', 'AGAINST': ''};
  } else if (vote_button == 'ABSTAIN'){
    return {'FOR': '', 'ABSTAIN': 'voted', 'AGAINST': ''};
  } else if (vote_button == 'AGAINST'){
    return {'FOR': '', 'ABSTAIN': '', 'AGAINST': 'voted'};
  }
}