MESSAGES = {
  'SUCCESSFULLY_CONN': 'Connection Successfully Made, Please Switch to "Adless Spotify Player" in Spotify',
  'CONNECTING': 'Connecting....',
  'CONNECTION_FAILED': 'Connection Failed For Reason: ',
  'PLAYER_ACTIVE': 'Player Active',
}

connect = () => {
  player = new Spotify.Player({
    name: 'Adless Spotify Player',
    getOAuthToken: cb => { cb(document.getElementById('token').value) }
  });
  player.addListener('ready', onSuccessfulConnection);
  player.addListener('player_state_changed', onPlayerStateChange);

  player.addListener('initialization_error', onUnsuccessfulConnection);
  player.addListener('authentication_error', onUnsuccessfulConnection);
  player.addListener('account_error', onUnsuccessfulConnection);
  player.addListener('playback_error', onUnsuccessfulConnection);

  setStatus(MESSAGES['CONNECTING']);
  document.getElementById('connect-button').disabled = true;
  player.connect();
}

onSuccessfulConnection = () => {
  localStorage.setItem('token', document.getElementById('token').value);
  setView(null);

  setStatus(MESSAGES['SUCCESSFULLY_CONN']);
}

onUnsuccessfulConnection = ({message}) => {
  localStorage.removeItem('token');
  setView('connect-template');
  document.getElementById('connect-button').disabled = false;

  setStatus(MESSAGES['CONNECTION_FAILED'] + message);
}

var muted = false;
onPlayerStateChange = async (state) => {
  if (state) {
    if (status_element.innerHTML == MESSAGES['SUCCESSFULLY_CONN']) {
      setView('controller-template');
      setStatus(MESSAGES['PLAYER_ACTIVE']);

      toggle_button = document.getElementById('toggle-button');
      music_name = document.getElementById('music-name');
      artist_name = document.getElementById('artist-name');
      album_image = document.getElementById('album-image');
    }

    toggle_button.innerHTML = state.paused ? 'Resume' : 'Pause';
    music_name.innerHTML = state.track_window.current_track.name;
    artist_name.innerHTML = state.track_window.current_track.artists.map(artist => artist.name).join(', ');
    album_image.src = state.track_window.current_track.album.images[0].url;

    if (state.track_window.current_track.type == "ad") {
      if (!muted) {
        old_volume = await player.getVolume();
        old_volume = old_volume ? old_volume : 0;
        player.setVolume(0);
        muted = true;
      }
    } else {
      if (muted) {
        player.setVolume(old_volume);
        muted = false;
      }
    }

  } else {
    setView(null);

    setStatus(MESSAGES['SUCCESSFULLY_CONN']);
  }
}


const status_element = document.getElementById('status');
setStatus = (new_status) => {
  status_element.innerHTML = new_status;
}

const view = document.getElementById('view');
setView = (template_id) => {
  while (view.firstChild) view.removeChild(view.firstChild);
  if (template_id) {
    var temp = document.getElementById(template_id);
    var clon = temp.content.cloneNode(true);
    view.appendChild(clon);
  }
}

window.onSpotifyWebPlaybackSDKReady = () => {
  setView('connect-template');
  document.getElementById('connect-button').disabled = false;

  if (token = localStorage.getItem("token")) {
    document.getElementById('token').value = token;
    connect();
  }
};
