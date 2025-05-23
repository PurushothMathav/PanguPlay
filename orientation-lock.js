// Function to handle orientation lock
function setupOrientationLock() {
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) return; // Exit if not on mobile

  // Check if we're on the player page
  const isPlayerPage = window.location.pathname.includes('player.html');

  // Track fullscreen state
  let isFullScreen = false;

  // Function to check if we're in fullscreen mode
  function checkFullScreen() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) !== null;
  }

  // Function to lock orientation to portrait
  function lockToPortrait() {
    // Skip orientation lock if we're in fullscreen mode
    if (isFullScreen) return;

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(err => {
        console.log('Orientation lock failed: ', err);
      });
    } else if (window.orientation !== undefined) {
      // Handle older devices (mostly iOS)
      if (window.orientation !== 0 && window.orientation !== 180) {
        console.log('Please rotate to portrait mode');
        if (isPlayerPage) {
          enterVideoFullscreen();
        }
      }
    }
  }

  // Function to enter fullscreen for the video
  function enterVideoFullscreen() {
    if (isPlayerPage && !isFullScreen) {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) {
          videoElement.webkitRequestFullscreen();
        } else if (videoElement.mozRequestFullScreen) {
          videoElement.mozRequestFullScreen();
        } else if (videoElement.msRequestFullscreen) {
          videoElement.msRequestFullscreen();
        }
      }
    }
  }

  // Update fullscreen tracking state
  function updateFullScreenState() {
    const wasFullScreen = isFullScreen;
    isFullScreen = checkFullScreen();

    // Re-lock orientation after exiting fullscreen
    if (wasFullScreen && !isFullScreen) {
      lockToPortrait();
    }
  }

  // Add fullscreen change event listeners
  document.addEventListener('fullscreenchange', updateFullScreenState);
  document.addEventListener('webkitfullscreenchange', updateFullScreenState);
  document.addEventListener('mozfullscreenchange', updateFullScreenState);
  document.addEventListener('MSFullscreenChange', updateFullScreenState);

  // Apply lock on page load
  lockToPortrait();

  // Apply lock when page becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && !isFullScreen) {
      lockToPortrait();
    }
  });

  // Handle orientation changes
  window.addEventListener('orientationchange', function () {
    if (isPlayerPage) {
      const orientation = window.orientation;
      if (orientation === 90 || orientation === -90) {
        // Landscape mode
        setTimeout(enterVideoFullscreen, 100);
      } else if (!isFullScreen) {
        setTimeout(lockToPortrait, 100);
      }
    } else {
      if (!isFullScreen) {
        setTimeout(lockToPortrait, 100);
      }
    }
  });

  // Handle SPA navigation or back/forward actions
  window.addEventListener('popstate', function () {
    if (!isFullScreen) {
      lockToPortrait();
    }
  });
}

// Set up the orientation lock when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupOrientationLock);
} else {
  setupOrientationLock();
}
