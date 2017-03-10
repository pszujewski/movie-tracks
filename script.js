// For querying the MovieDB for a movie title's ID
const S_BASE_URL="https://api.themoviedb.org/3/search/movie?api_key=1710c94a1d9a1c75e363bf47a0f446b3";
// The url path for getting the poster image in the Movie DB
const MOVIE_API_KEY = "?api_key=1710c94a1d9a1c75e363bf47a0f446b3";

// Object for managing state
var state = {
  movieData: {},
  musicData: {},
  favorites: [],
  rndmFilms: []
};

// Empty arrays to hold separate data from the movie DB. JQuery UI's autocomplete
// method will point to movieTitles as its 'source'
// These arrays will be populated with data from the Movie DB upon loading the doc
var genreIds = [];
var movieTitles = [];

//To generate random numbers
function doRndm() {
  return Math.floor(Math.random()*211);
}

// Determine the number of stars to associate with the movie
function getNumStars(state) {
  let rating = state.movieData.rating;
  if (rating > 8) { return 5}
  else if (rating <= 8 && rating > 6) { return 4 }
  else if (rating <= 6 && rating > 4) { return 3 }
  else if (rating <= 4 && rating > 2) { return 2 }
  else { return 1 }
}

// Functions for populating the movies titles array for the autocomplete functionality
// query to movie DM to get a list of titles under each genre
function getTitles(id) {
  let genreReq = `https://api.themoviedb.org/3/genre/${id}/movies${MOVIE_API_KEY}&language=en-US&include_adult=false&sort_by=created_at.asc`;
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

// Query the movie DM to get a list of all genres with their ids.
// Save the ids in the genreIds array and invoke getTitles for each genre id
function getGenres(state) {
  let listRequest = `https://api.themoviedb.org/3/genre/movie/list${MOVIE_API_KEY}&language=en-US`;
  let rndm = [doRndm(), doRndm(), doRndm()];
  console.log(rndm);
  $.ajax({
    url: listRequest,
    success: function(result) {
      result.genres.forEach(function(item) {
        genreIds.push(item.id);
      });
      genreIds.forEach(function(id) {
        getTitles(id);
      });
      rndm.forEach(function(num) {
        state.rndmFilms.push(movieTitles[num]);
      });
      console.log(state.rndmFilms);
    }
  });
}

// Funciton to handle API calls and handle data for a user search
// Get the data from the movie API
function getMovieData(searchTerm) {
  $.ajax({
    url: S_BASE_URL,
    data: {query: searchTerm},
    success: function(data) {
      let urlSearchID = "https://api.themoviedb.org/3/movie/"+data.results[0].id+MOVIE_API_KEY;
      $.ajax({
        url: urlSearchID,
        success: function(result) {
          state.movieData.title = result.title.toUpperCase();
          state.movieData.year = result.release_date.substr(0, 4);
          state.movieData.poster = "https://image.tmdb.org/t/p/w500"+result.poster_path;
          state.movieData.desc = result.overview;
          state.movieData.rating = result.vote_average;
          state.movieData.tagline = result.tagline;
          state.movieData.site = result.homepage;
          state.movieData.backdropImg = "https://image.tmdb.org/t/p/w500"+result.backdrop_path;
          //console.log(state.movieData);
          renderMovie(state, $("#movie-info"));
        }
      });
    }
  });
}

// Get Data from the music API
// function getMusicData(userSearch) {....
//   $.getJSON('http://spotifydata.com/', function() {
//     // updateState() -->
//     // Album and tracks inside the album(s)
//     // Links to the audio file
//     // image of the album art
//     // composer or various artists
//     renderToDOM();
//   });
// }
//
// function loadData(userSearch) {
//   getMovieData(userSearch);
// }

// Functions for rendering state to the DOM
function doStars(state) {
  let numStars = getNumStars(state);
  for (let i=1; i<=numStars; i++) {
    let star = `#star-${i}`;
    $(star).removeClass("fa-star-o").addClass("fa-star");
  }
}

function renderMovie(state, $element) {
  let m = state.movieData;
  let filmHtml = (`<div class='three columns'>
                <div class="img-wrapper">
                  <img src=${m.poster} id='movie-poster'>
                </div>
               </div>
               <div class='nine columns'>
                <div class='row' id='inside-cont'>
                  <div class='ten columns'>
                    <h4>${m.title}</h4>
                    <div id="stars-container">
                      <i id='star-1' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-2' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-3' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-4' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-5' class="fa fa-star-o" aria-hidden="true"></i>
                    </div>
                    <p><i class="fa fa-heart-o" aria-hidden="true"></i>  Add to favorites</p>
                  </div>
                  <div class='two columns'>
                   <h4 id='year'>(${m.year})</h4>
                  </div>
                </div>
                <p><em>${m.tagline}</em></p>
                <p>${m.desc}</p>
               </div>`);
  $element.html(filmHtml);
  doStars(state);
}

// Event Listeners
// Handle each time a user searches for a movie title
function handleSearch($btn, $input) {
  $btn.on("click", function(e) {
    let movieLoaded = false;
    let spotifyLoaded = false;
    let userSearch = $input.val();
    getMovieData(userSearch);
  });
}

// Handle the autocomplete functionality
function doAutocomplete($input) {
  $input.autocomplete({
     source: movieTitles,
     minLength: 2,
     delay: 500
  });
}

// Invoke Functions, document ready...
$(document).ready(function() {
  getGenres(state);
  doAutocomplete($("#search"));
  handleSearch($("#btn"), $("#search"));
});
