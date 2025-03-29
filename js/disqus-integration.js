// Disqus OAuth Configuration
const DISQUS_CONFIG = {
  apiKey: '1Qk4ezR8TniXSSmvY5WHuh16zq44dlNcLI2VU7wNQIN3mupnkZwGiqQku4IWoHdb',
  apiSecret: 'mGW2Ria8C2Exq9s1MtObiuf36EFCkktAfIqkYkRassXFqMNSYzzz9NC69e2WAsh5',
  authorizeUrl: 'https://disqus.com/api/oauth/2.0/authorize/',
  accessTokenUrl: 'https://disqus.com/api/oauth/2.0/access_token/',
  callbackUrl: 'https://purushothmathav.github.io/PanguPlay/discussion.html'
};

// Initialize Disqus with OAuth
function initDisqus() {
  // Create Disqus config object
  window.disqus_config = function() {
    this.page.url = window.location.href;
    this.page.identifier = 'panguplay-discussions'; // Unique identifier for this page
    this.page.title = 'PanguPlay Community Discussions';
    
    // OAuth authentication settings
    this.sso = {
      name: 'PanguPlay',
      button: 'https://purushothmathav.github.io/PanguPlay/assets/login-button.png',
      url: DISQUS_CONFIG.authorizeUrl,
      logout: 'https://purushothmathav.github.io/PanguPlay/logout',
      width: '800',
      height: '400'
    };
  };
  
  // Load the Disqus embed script
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://panguplay.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
  
  // Also load the comment count script
  (function() {
    var s = document.createElement('script');
    s.id = 'dsq-count-scr';
    s.src = 'https://panguplay.disqus.com/count.js';
    s.async = true;
    document.body.appendChild(s);
  })();
}

// Handle OAuth authentication flow
function handleDisqusAuth() {
  // Check if we're returning from OAuth authorization
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');
  
  if (authCode) {
    // Exchange authorization code for access token
    fetch(DISQUS_CONFIG.accessTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'client_id': DISQUS_CONFIG.apiKey,
        'client_secret': DISQUS_CONFIG.apiSecret,
        'redirect_uri': DISQUS_CONFIG.callbackUrl,
        'code': authCode
      })
    })
    .then(response => response.json())
    .then(data => {
      // Store the access token
      localStorage.setItem('disqus_access_token', data.access_token);
      
      // Initialize Disqus with the token
      initDisqus();
    })
    .catch(error => {
      console.error('Disqus authentication error:', error);
      // Initialize Disqus without authentication as fallback
      initDisqus();
    });
  } else {
    // No auth code, just initialize Disqus normally
    initDisqus();
  }
}

// Call the authentication handler when page loads
document.addEventListener('DOMContentLoaded', handleDisqusAuth);