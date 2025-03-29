// Disqus Configuration - Simplified for security
const DISQUS_CONFIG = {
  // Never expose API secrets in client-side code
  // These should be managed server-side
  callbackUrl: 'https://purushothmathav.github.io/PanguPlay/discussion.html'
};

// Initialize Disqus
function initDisqus() {
  // Reset Disqus if it was previously loaded
  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config: function() {
        this.page.url = window.location.href;
        this.page.identifier = 'panguplay-discussions';
        this.page.title = 'PanguPlay Community Discussions';
      }
    });
    return;
  }
  
  // Create Disqus config object - simplified without OAuth
  window.disqus_config = function() {
    this.page.url = window.location.href;
    this.page.identifier = 'panguplay-discussions'; 
    this.page.title = 'PanguPlay Community Discussions';
  };
  
  // Load the Disqus embed script
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://panguplay.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
}

// Main function
document.addEventListener('DOMContentLoaded', function() {
  // Check if Disqus container exists
  if (document.getElementById('disqus_thread')) {
    initDisqus();
    
    // Add error handling to detect loading problems
    window.addEventListener('error', function(event) {
      if (event.target.src && event.target.src.indexOf('disqus.com') !== -1) {
        const disqusThread = document.getElementById('disqus_thread');
        disqusThread.innerHTML = '<div style="color: #b3b3b3; text-align: center; padding: 20px;">' +
          '<p>We\'re having trouble loading comments. Please try refreshing the page or check if your ad blocker is preventing Disqus from loading.</p>' +
          '<button onclick="initDisqus()" style="background-color: #e50914; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Retry Loading Comments</button>' +
          '</div>';
      }
    }, true);
  }
});