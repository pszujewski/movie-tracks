// Object for managing state
var state = {
  movieData: {},
  musicData: {
    albumTitle: '',
    albumSpotifyID: '',
    composer: '',
    trackCount: 0,
    tracks: [],
    albumArtURL: ''
  }
};

const SPOT_TOKEN="BQD4KXJT3tNQA_-DyX0BGAo8BnXA-eg_2kHLFW5tApy6i80YWQTzQHu1cRZ66zzshE_8Zr6-q79RIA9BFCUKHw5Osa51xjM0C1tWU9jlFbMMuVL5bz1V7ZFos1onHaYZe5dcf79AGJAvw7g";

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
      //console.log(movieTitles);
    }
  });
}

// API calls and handle data for a user search
// Get the data from the movie API

function getMovieData(userSearch) {
// $.getJSON('http://moviedata.com/', function() {
//   // updateState() -->
//   // Poster image Link
//   // Description
//   // Any ratings
//   // year of release
//   // Cast
//   getMusicData(userSearch);
// });
}

// Get Data from the music API
function getMusicData(userSearch) {
  let SPOT_URL = 'https://api.spotify.com/v1/search/';
  let albumQuery = {
    q: userSearch,
    type: 'album'
  };
  $.getJSON(SPOT_URL, albumQuery, function(response) {
    console.log(response);
    setMusicData(response);
    // updateState() -->
    // Album and tracks inside the album(s)
    // Links to the audio file
    // image of the album art
    // composer or various artists
    // renderToDOM();
  });
}

function setMusicData(response){
  // albumTitle
  // composer
  // albumArtURL
  // trackCount
  // tracks
  state.musicData.albumTitle=response.albums.items[0].name;
  state.musicData.albumSpotifyID=response.albums.items[0].id;
  state.musicData.composer=response.albums.items[0].artists.name;
  state.musicData.albumArtURL=response.albums.items[0].images[1].url;
  var id = state.musicData.albumSpotifyID;
  var SPOT_URL = 'https://api.spotify.com/v1/albums/'+id;
  // let tracksQuery = {
  //   q: id
  // };
  $.getJSON(SPOT_URL, function (response) {
        state.musicData.tracks=response.tracks.items;
        console.log("yo");
        console.log(response);
      });
  // fetchTracks(state.musicData.albumSpotifyID, function(response){
  //   state.musicData.tracks=response.tracks.items;
  //   console.log(state.musicData);
  // });
}

//get tracks of the album specified ID
function fetchTracks(id, callback) {
  $.getJSON({
      url: 'https://api.spotify.com/v1/albums/'+id,
      success: function (response) {
        callback(response);
      }
    }
  );
}

function loadData(userSearch) {
  getMovieData(userSearch);
}

// Event Listener
function handleSearch($btn, $input) {
  $btn.on("click", function(e) {
    let movieLoaded = false;
    let spotifyLoaded = false;
    let userSearch = $input.val();
    // loadData(function() { updateState() }
    // renderToDOM();
    console.log(userSearch);
    getMusicData(userSearch);
  });
}


// Invoke Functions
$(document).ready(function() {

  getGenres();

  $("#search").autocomplete({
     source: movieTitles,
     minLength: 2,
     delay: 500
  });

  handleSearch($("#btn"), $("#search"));

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
