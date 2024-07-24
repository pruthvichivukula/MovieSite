const VOTE_FOR = 'FOR';
const VOTE_ABSTAIN = 'ABSTAIN';
const VOTE_AGAINST = 'AGAINST';

function isValidVote(vote_in){
    return (vote_in === VOTE_FOR) || (vote_in === VOTE_ABSTAIN) || (vote_in === VOTE_AGAINST);
}

module.exports = {
    VOTE_FOR: VOTE_FOR,
    VOTE_ABSTAIN: VOTE_ABSTAIN,
    VOTE_AGAINST: VOTE_AGAINST,
    isValidVote: isValidVote
}