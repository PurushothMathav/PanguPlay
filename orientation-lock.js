// Function to handle orientation lock
function setupOrientationLock() {
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return; // Exit if not on mobile
  
  // Function to lock orientation
  function lockToPortrait() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(err => {
        console.log('Orientation lock failed: ', err);
      });
    } else if (window.orientation !== undefined) {
      // Handle older devices (mostly iOS)
      if (window.orientation !== 0 && window.orientation !== 180) {
        // This is just a notification as direct locking isn't supported on iOS
        console.log('Please rotate to portrait mode');
      }
    }
  }
  
  // Apply lock on page load
  lockToPortrait();
  
  // Apply lock when page becomes visible again (tab switching or returning)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      lockToPortrait();
    }
  });
  
  // Handle orientation changes
  window.addEventListener('orientationchange', function() {
    // Reapply lock with a slight delay after orientation changes
    setTimeout(lockToPortrait, 100);
  });
  
  // For single-page applications or when using history API
  window.addEventListener('popstate', function() {
    lockToPortrait();
  });
}

// Set up the orientation lock when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupOrientationLock);
} else {
  setupOrientationLock();
}