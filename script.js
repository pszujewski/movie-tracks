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
var autocomp = {
  genreIds: [],
  movieTitles: []
};

// Functions that modify or retrieve data from state
// input: state, returns: alert if favorites less than 5
function addFavorite(state) {
  if (state.favorites.length < 5) {
    state.favorites.push({ title: state.movieData.title,
                           poster: state.movieData.poster });
  } else {
    alert("Please only add up to 5 favorites");
  }
}

function removeFavorite(state, index) {
  let favs = state.favorites;
  favs.splice(index, 1);
}

//input: state, retuns boolean value
function checkIsFavorite(state) {
  let current = state.movieData;
  let favs = state.favorites;
  for (let i=0; i<favs.length; i++) {
    if(favs[i].title === current.title) {
      return [true, i];
    }
  }
  return [false, 0];
}

//Converts ten point rating to five star rating and returns it
function getNumStars(state) {
  let rating = state.movieData.rating;
  if (rating > 8) { return 5; }
  else if (rating <= 8 && rating > 6) { return 4; }
  else if (rating <= 6 && rating > 4) { return 3; }
  else if (rating <= 4 && rating > 2) { return 2; }
  else if (rating === 0) { return 2; }
  else { return 1; }
}


// Functions for populating the movie titles array for the autocomplete functionality
// query to movie DM to get a list of titles under each genre
function getTitles(id) {
  let genreReq = `https://api.themoviedb.org/3/genre/${id}/movies${MOVIE_API_KEY}&language=en-US&include_adult=false&sort_by=created_at.asc`;
  $.ajax({
    url: genreReq,
    success: function(data) {
      data.results.forEach(function(item) {
        if (autocomp.movieTitles.indexOf(item.title) === -1) {
          autocomp.movieTitles.push(item.title);
        }
      });
    }
  });
}

// Query the movie DM to get a list of all genres with their ids.
// Save the ids in the genreIds array and invoke getTitles for each genre id
function getGenres(state) {
  let listRequest = `https://api.themoviedb.org/3/genre/movie/list${MOVIE_API_KEY}&language=en-US`;
  $.ajax({
    url: listRequest,
    success: function(result) {
      result.genres.forEach(function(item) {
        autocomp.genreIds.push(item.id);
      });
      autocomp.genreIds.forEach(function(id) {
        getTitles(id);
      });
    }
  });
}

// Functions to handle API calls and update data in state to be displayed
// Get Data from the Music API
// Functions to music data to update state and render music data in the DOM
function getMusicData(userSearch) {
  let SPOT_URL = 'https://api.spotify.com/v1/search/';
  let albumQuery = {
    q: userSearch,
    type: 'album'
  };
  $.getJSON(SPOT_URL, albumQuery, function(response) {
    // updates state --> links, image urls, artists name, tracks
    setMusicInState(response);
  });
}

//This funciton can be broken down into two
// Updates state with music data
function setMusicInState(response) {
  var mc = state.musicData;
  let bestCandidate = response.albums.items[0];
  let bestScore = 0;
  response.albums.items.forEach(function (album, idx) {
    let newScore = 0;
    if (album.name.toLowerCase().indexOf("soundtrack") !== -1) {
      newScore += 10;
    }
    if (album.name.toLowerCase().indexOf("motion") !== -1) {
      newScore += 7;
    }
    if (album.name.toLowerCase().indexOf("picture") !== -1) {
      newScore += 7;
    }
    if (album.name.match(state.movieData.title)) {
      console.log(album.name.match(state.movieData.title));
      newScore += 15;
    }
    if (newScore > bestScore) {
      bestScore = newScore;
      bestCandidate = album;
    }
  });
  let id = bestCandidate.id;
  let SPOT_URL = 'https://api.spotify.com/v1/albums/'+id;
  mc.albumTitle = bestCandidate.name;
  mc.albumSpotifyID = bestCandidate.id;
  mc.composer = bestCandidate.artists.name;
  mc.albumArtURL = bestCandidate.images[1].url;
  console.log(response);
  $.getJSON(SPOT_URL, function(data) {
      mc.tracks = data.tracks.items;
      renderMovie(state, $("#movie-info"));
      renderMusic(state, $('#music-info'));
      //console.log(state.musicData);
  });
}

// Renders the music data into the DOM
function renderMusic(state, $music) {
  let stringMusicHTML = '';
  stringMusicHTML+=`<h3 class="album-title">${state.musicData.albumTitle}</h3>
                    <div class="four columns">
                      <img class="album-art" src="${state.musicData.albumArtURL}" alt="Album Art for ${state.musicData.albumTitle}" />
                    </div>
                    <div class="seven columns track-list">
                    <ol>`;
  for (i=0; i<state.musicData.tracks.length; i++) {
    stringMusicHTML+=`<li class="track-name" data-trackNum="${i}"><i class="fa fa-play-circle play-status" aria-hidden="true"></i>${state.musicData.tracks[i].name}</li>`;
  }
  stringMusicHTML+=`</div></ol>`;
  $music.html(stringMusicHTML);
}

// Functions for handling the requests to the Movie DB
// Functions to update the data to state and render that data follows as well
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
          // getMusicData() --> Goes here
          // Movie data will be retrieved first and then the music data
          console.log(result);
          // setbackground
          $('body').css({ "background-image": `url(${state.movieData.poster})` });
          //$('body').attr('style', `background:url('${state.movieData.poster}') 100% 100% no-repeat center center;`);
          getMusicData(searchTerm);
        }
      });
    }
  });
}

// Functions for rendering Movie data state to the DOM
function doStars(state) {
  let numStars = getNumStars(state);
  for (let i=1; i<=numStars; i++) {
    let star = `#star-${i}`;
    $(star).removeClass("fa-star-o").addClass("fa-star");
  }
}

function renderMovie(state, $element) {
  let m = state.movieData;
  let isFavorite = checkIsFavorite(state);
  let heart = isFavorite[0] ? "fa-heart" : "fa-heart-o";
  let filmHtml =
              (`<div class='three columns' id='left-well'>
                  <img src=${m.poster} id='movie-poster'>
               </div>
               <div class='nine columns'>
                <div class='row'>
                  <div class='ten columns'>
                    <h4>${m.title}</h4>
                    <div id="stars-container">
                      <i id='star-1' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-2' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-3' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-4' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-5' class="fa fa-star-o" aria-hidden="true"></i>
                    </div>
                    <p><i id='heart' class="fa ${heart}" aria-hidden="true"></i>  Add to favorites</p>
                  </div>
                  <div class='two columns' id='year-wrapper'>
                   <h4 id='year'>(${m.year})</h4>
                  </div>
                </div>
                <p><em>${m.tagline}</em></p>
                <p id='desc'>${m.desc}</p>
               </div>`);
  $element.html(filmHtml);
  doStars(state);
}


// Event Listeners
// Handle each time a user searches for a movie title
function handleSearch($btn, $input) {
  $btn.on("click", function(e) {
    let userSearch = $input.val();
    getMovieData(userSearch);
  });
}

function playMusic($container) {
  $container.on('click', function(event) {
    let target= event.target;
    console.log(target);
    $('.fa-stop-circle').removeClass('fa-stop-circle').addClass('fa-play-circle');
    if(state.musicData.isPlaying) {
      audioPlayer.pause();
      // $('.track-name').removeClass('js-isPlaying');

      $(target).find('i').removeClass('fa-stop-circle').addClass('fa-play-circle');
      state.musicData.isPlaying = false;
    } else {
      state.musicData.isPlaying = true;
      audioPlayer = new Audio(state.musicData.tracks[target.dataset.tracknum].preview_url);
      audioPlayer.play();
      $(target).find('i').removeClass('fa-play-circle').addClass('fa-stop-circle');
      //console.log()
    }
  });
}

// Handle the autocomplete functionality
function doAutocomplete($input) {
  getGenres(state);
  $input.autocomplete({
     source: autocomp.movieTitles,
     minLength: 2,
     delay: 300
  });
}

function handleAddFavorite($container) {
  $container.on("click", "#heart", function(e) {
    let isFavorite = checkIsFavorite(state);
    if (!isFavorite[0]) {
      addFavorite(state);
      $("#heart").removeClass("fa-heart-o").addClass("fa-heart");
    } else {
      removeFavorite(state, isFavorite[1]);
      $("#heart").removeClass("fa-heart").addClass("fa-heart-o");
    }
  });
}

// Invoke Functions, document ready...
$(document).ready(function() {
  doAutocomplete($("#search"));
  handleSearch($("#btn"), $("#search"));
  handleAddFavorite($("#movie-info"));
  playMusic($('#music-info'));
});
