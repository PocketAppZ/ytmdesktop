const scribble = require("scribble");
const settingsProvider = require("./settingsProvider");
const http = require("http");
const Base64 = require("js-base64").Base64;

const apiKey = "9ab417e8b808ed071223a1b4b3c29642";
const apiSecret = "9d8830c167627e65dac63786be101964";

var Scrobbler;

var userLogin;
var updateTrackInfoTimeout;

function signIn() {
  userLogin = getLogin();
  if (userLogin) {
    Scrobbler = new scribble(
      apiKey,
      apiSecret,
      userLogin.username,
      userLogin.password
    );
  }
}

function setLogin(username, password) {
  settingsProvider.set("last-fm-login", {
    username: username,
    password: Base64.encode(password)
  });
}

function getLogin() {
  var login = settingsProvider.get("last-fm-login");
  if (login.username != "") {
    login.password = Base64.decode(login.password);
    return login;
  }

  return false;
}

function getToken() {
  http.get(
    `http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=${apiKey}&format=json`,
    function(res) {
      let rawData = "";
      res.on("data", chunk => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          authorize(parsedData.token);
        } catch (e) {
          console.error(e.message);
        }
      });
    }
  );
}

function updateTrackInfo(title, author) {
  if (settingsProvider.get("settings-last-fm-scrobbler")) {
    if (updateTrackInfoTimeout) {
      clearInterval(updateTrackInfoTimeout);
    }
    updateTrackInfoTimeout = setTimeout(() => {
      if (Scrobbler === undefined) {
        signIn();
      }

      var track = {
        artist: author,
        track: title
      };
      Scrobbler.Scrobble(track, function(_) {});
    }, 10 * 2000);
  }
}

function authorize(token) {
  var authorize = window.open(
    `https://www.last.fm/api/auth?api_key=${apiKey}&token=${token}`,
    "Authorize App",
    "frame=true"
  );
}

module.exports = {
  getToken: getToken,
  updateTrackInfo: updateTrackInfo,
  getLogin: getLogin,
  setLogin: setLogin,
  authorize: authorize
};
