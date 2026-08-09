// Example of reading a local environment setup
const apiKey = AIzaSyBoz19vFCo7vOJ3DHZLJYoq9lRCe7fh0BEa
;

function initializePlayer() {
  if (!apiKey) {
    console.error("API key is missing from the local environment.");
    return;
  }
  
  // Setup your player logic here using the local variable
// 1. Global player variable
let player;

// 2. This function runs automatically when the YouTube API script loads
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player-container', {
    height: '360',
    width: '640',
    videoId: 'YOUR_VIDEO_ID', // Replace with a specific YouTube video ID
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 3. Triggered when the player is loaded and ready
function onPlayerReady(event) {
  // You can automatically play the video or enable custom controls here
  console.log("Player is ready!");
}

// 4. Triggered whenever the video state changes (playing, paused, ended, etc.)
function onPlayerStateChange(event) {
  // YT.PlayerState.PLAYING, PAUSED, ENDED, etc.
  if (event.data == YT.PlayerState.PLAYING) {
    console.log("Video is currently playing");
  }
}}
