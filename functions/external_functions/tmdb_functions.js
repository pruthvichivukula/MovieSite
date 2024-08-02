const request = require('request');


function sendRequest(options){

    return new Promise((resolve, reject) =>{
        try{
            request(options, function (error, response, body) {
                if (error){
                    return reject(error)
                }
                
                //console.log(body);
                return resolve(body);
            });
        }
        catch(e){
            reject(e)
        }
    })
}



function getMovieDetailsByID(movieID) {

    const options = {
    method: 'GET',
    url: 'https://api.themoviedb.org/3/movie/' + movieID.toString() + '?language=en-US',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWIyNThiOTQwMjExZTg2YWEzNDM2ODhiZDY2OGZiZSIsInN1YiI6IjY1OWUxMjkxOWJjZDBmMDFhMmMxNWNjZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3dWxE_9FcStrOG-nv3r7TpUqgAqaT4YNA3L47qkLYRg'
    }
    };

    return sendRequest(options);

}


async function asyncGetMovieDetailsByID(movieID){
    console.log("getting movie details for: " + movieID);
    const res = await getMovieDetailsByID(movieID);
    console.log("result: " + res);
    return await res;
}

/*
var ret_res;
asyncGetMovieDetailsByID(568).then(data => {
    console.log(data);
    ret_res = data;
});

console.log("final res: " + asyncGetMovieDetailsByID(568))

*/




function searchMovies(search_terms){
    var search_terms_no_spaces = search_terms.replace(/ /g, "%20"); 

    const options = {
      method: 'GET',
      //url: 'https://api.themoviedb.org/3/search/movie?query=apollo 13&include_adult=false&language=en-US&page=1',
      url: 'https://api.themoviedb.org/3/search/movie?query=' + search_terms_no_spaces + '&include_adult=false&language=en-US&page=1',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWIyNThiOTQwMjExZTg2YWEzNDM2ODhiZDY2OGZiZSIsInN1YiI6IjY1OWUxMjkxOWJjZDBmMDFhMmMxNWNjZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3dWxE_9FcStrOG-nv3r7TpUqgAqaT4YNA3L47qkLYRg'
      }
    };

    return sendRequest(options);

}

async function asyncSearchMovies(search_term){
    console.log("getting movie details for: " + search_term);
    const res = await searchMovies(search_term);
    console.log("result: " + res);
    return await res;
}




module.exports = { 
    asyncSearchMovies: asyncSearchMovies,
    searchMovies: searchMovies
  }; 





