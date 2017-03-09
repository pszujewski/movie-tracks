// TMDB movie Database
// for searching the DB for a movie title's ID
const S_BASE_URL="https://api.themoviedb.org/3/search/movie?api_key=1710c94a1d9a1c75e363bf47a0f446b3";
// The url path for getting the poster image
const MEDIA_PATH = "https://image.tmdb.org/t/p/w500";
const API_KEY = "?api_key=1710c94a1d9a1c75e363bf47a0f446b3";

var genreIds = [];
var movieTitles = [];

function getTitles(id) {
  var genreReq = `https://api.themoviedb.org/3/genre/${id}/movies${API_KEY}&language=en-US&include_adult=false&sort_by=created_at.asc`;
  $.ajax({
    url: genreReq,
    success: function(data) {
      data.results.forEach(function(item) {
        if (movieTitles.indexOf(item.title) === -1) {
          movieTitles.push(item.title);
        }
      });
    }
  });
}

function getGenres() {
  // for getting the list of genres and their ids
  var listRequest = `https://api.themoviedb.org/3/genre/movie/list${API_KEY}&language=en-US`;
  $.ajax({
    url: listRequest,
    success: function(result) {
      result.genres.forEach(function(item) {
        genreIds.push(item.id);
      });
      genreIds.forEach(function(id) {
        getTitles(id);
      });
      console.log(movieTitles);
    }
  });
}

$(document).ready(function() {

  getGenres();

  $("#automplete-1").autocomplete({
     source: movieTitles,
     minLength: 2,
     delay: 500
  });

});


  // function makeQuery(baseUrl, callback, dataObj) {
  //   let query = {
  //     url: baseUrl,
  //     type: "GET",
  //     dataType: "json",
  //     success: callback,
  //     error: function() {
  //       console.error("There is an error");
  //     }
  //   };
  //   if (typeof dataObj !== "undefined") {
  //     query.data = dataObj;
  //   }
  //   return query;
  // }

  // function getIDDoReq(data) {
  //   let urlSearchID = "https://api.themoviedb.org/3/movie/"+data.results[0].id+API_KEY;
  //   let q = makeQuery(urlSearchID, function() {
  //
  //   });
  //   $.ajax(q);
  // }

  // function getTheMovieDB(searchTerm) {
  //   let idQuery = makeQuery(S_BASE_URL, getIDDoReq, {query: searchTerm});
  //   $.ajax(idQuery);
  // }



//getTheMovieDB("Inception")
