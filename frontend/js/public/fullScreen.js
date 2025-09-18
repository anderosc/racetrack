var elem = document.getElementById("content");

/* When the openFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
  document.getElementById("fullScreen").style.display = "none";
}

// Listen for fullscreen change to detect when user exits fullscreen
document.addEventListener("fullscreenchange", exitHandler);
document.addEventListener("webkitfullscreenchange", exitHandler); // Safari
document.addEventListener("msfullscreenchange", exitHandler); // IE11

function exitHandler() {
  // Check if we're no longer in fullscreen
  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    document.getElementById("fullScreen").style.display = "block";
  }
}




//https://www.w3schools.com/howto/howto_js_fullscreen.asp