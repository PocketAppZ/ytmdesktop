const { remote, ipcRenderer } = require("electron");
const request = require("request");
const __ = require("../../providers/translateProvider");

const url = "https://api.vagalume.com.br/search.php";

const window = remote.getCurrentWindow();
const elementLyric = document.getElementById("lyric");

let lastSong;
let lastArtist;

loadi18n();

/*document.getElementById("btn-close").addEventListener("click", function() {
  window.close();
});*/

setInterval(function() {
  ipcRenderer.send("what-is-song-playing-now");
}, 1000);

ipcRenderer.on("song-playing-now-is", function(e, data) {
  var scrollHeight = document.getElementById("content").scrollHeight;
  document
    .getElementById("content")
    .scrollTo(0, (scrollHeight * data.track.statePercent) / 1.4);

  getLyric(data.track.author, data.track.title);
});

function getLyric(artist, song) {
  if (artist != undefined && song != undefined) {
    if (artist != lastArtist && song != lastSong) {
      lastSong = song;
      lastArtist = artist;

      request(
        url + "?art=" + escapeHtml(artist) + "&mus=" + escapeHtml(song),
        { json: true },
        function(err, res, body) {
          if (err) {
            console.log("LYRICS ERRO");
            elementLyric.innerText = __.trans("LABEL_LYRICS_NOT_FOUND");
            return;
          }

          //document.getElementById("now-playing").innerText = song + " - " + artist;
          if (body.mus) {
            elementLyric.innerText = body.mus[0].text;
          } else {
            elementLyric.innerText = __.trans("LABEL_LYRICS_NOT_FOUND");
          }

          document.getElementById("content").scrollTop = 0;
        }
      );
    }
  } else {
    elementLyric.innerText = __.trans("LABEL_PLAY_MUSIC");
  }
}

function loadi18n() {
  document.getElementById("i18n_LABEL_LOADING").innerText = __.trans(
    "LABEL_LOADING"
  );
}

function escapeHtml(text) {
  var map = {
    "&": "and",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return text.replace(/[&<>"']/g, function(m) {
    return map[m];
  });
}
