// Example of reading a local environment setup
// NOTE: You asked to keep the API in the file, so it's preserved here as a string constant.
// Be aware that committing API keys to source control is a security risk.
const apiKey = 'AIzaSyBoz19vFCo7vOJ3DHZLJYoq9lRCe7fh0BEa';

// Global player variable
let player;

// Initialize player: checks for API key and loads the YouTube IFrame API if needed
function initializePlayer() {
  if (!apiKey) {
    console.error('API key is missing from the local environment.');
    return;
  }

  if (typeof window === 'undefined') {
    console.error('initializePlayer must be called in a browser environment.');
    return;
  }

  // Dynamically load YouTube IFrame API if it's not already loaded
  if (!window.YT || !window.YT.Player) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
    // The API will call the global onYouTubeIframeAPIReady when it's loaded
  } else {
    // If API is already available, create the player immediately
    onYouTubeIframeAPIReady();
  }
}

// This function MUST be global so the YouTube API can call it when the script loads
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player-container', {
    height: '360',
    width: '640',
    videoId: 'YOUR_VIDEO_ID', // Replace with a specific YouTube video ID
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// Triggered when the player is loaded and ready
function onPlayerReady(event) {
  console.log('Player is ready!');
  // Optionally: event.target.playVideo();
}

// Triggered whenever the video state changes (playing, paused, ended, etc.)
function onPlayerStateChange(event) {
  // YT.PlayerState.PLAYING, PAUSED, ENDED, etc.
  if (event.data === YT.PlayerState.PLAYING) {
    console.log('Video is currently playing');
  } else if (event.data === YT.PlayerState.PAUSED) {
    console.log('Video is paused');
  } else if (event.data === YT.PlayerState.ENDED) {
    console.log('Video has ended');
  }
}

// Expose initializePlayer globally if scripts expect it
window.initializePlayer = initializePlayer;
