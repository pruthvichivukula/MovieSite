
async function press_vote_button(element) {
    var authed = await is_authed(element);
    console.log(authed);

}


function voteClassToggle(element){
    //element.classList.toggle("voted");
    var class_name = "movie_" + JSON.parse(element.value).movie_id; 
    var buttons = document.getElementsByClassName(class_name);

    for (var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove("voted");
    }
    element.classList.add("voted");

}

function is_authed(element){
    const xhttp = new XMLHttpRequest();
    //var is_authed;
    xhttp.onload = async function() {
            var is_authed = await JSON.parse(this.responseText).authed;
            //document.getElementById("authed_text").innerHTML = typeof(is_authed);
            if (is_authed){
                vote_toggle_button(element)
            }
            return is_authed;
    }
    xhttp.open("GET", "is_authed");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}


function vote_toggle_button(element){
    voteClassToggle(element);
    var movie_id = JSON.parse(element.value).movie_id;
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        //document.getElementById("vote_text_out").innerHTML = this.responseText;
        var vote_count = JSON.parse(this.responseText);
        document.getElementById("score_FOR_" + movie_id.toString()).innerText = vote_count.vote_count_for;
        document.getElementById("score_ABSTAIN_" + movie_id.toString()).innerText = vote_count.vote_count_abstain;
        document.getElementById("score_AGAINST_" + movie_id.toString()).innerText = vote_count.vote_count_against;
        document.getElementById("score_" + movie_id.toString()).innerText = vote_count.score;

    }
    xhttp.open("POST", "ajax_votes");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("button=" + element.value);

}

