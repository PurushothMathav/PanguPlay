// Example implementation using Express.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Path to your data file
const DATA_FILE = path.join(__dirname, 'video-stats.json');

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
  }
}

// Get video stats from file
function getVideoStats() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Save video stats to file
function saveVideoStats(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Get or create video entry
function getVideoEntry(videoId, data) {
  if (!data[videoId]) {
    data[videoId] = {
      likes: 0,
      dislikes: 0,
      views: 0,
      userInteractions: {} // Track which users have interacted and how
    };
  }
  return data;
}

// API endpoint to get video stats
app.get('/api/video-stats', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }
  
  const data = getVideoStats();
  const videoData = data[videoId] || { likes: 0, dislikes: 0, views: 0 };
  
  res.json({
    likes: videoData.likes,
    dislikes: videoData.dislikes,
    views: videoData.views
  });
});

// API endpoint to record a view
app.post('/api/record-view', (req, res) => {
  const { videoId, userId } = req.body;
  
  if (!videoId || !userId) {
    return res.status(400).json({ error: 'Video ID and User ID are required' });
  }
  
  let data = getVideoStats();
  data = getVideoEntry(videoId, data);
  
  // Check if this user already viewed this video (in our permanent record)
  const userViews = data[videoId].userViews || {};
  if (!userViews[userId]) {
    data[videoId].views += 1;
    userViews[userId] = true;
    data[videoId].userViews = userViews;
    saveVideoStats(data);
  }
  
  res.json({ views: data[videoId].views });
});

// API endpoint to rate a video
app.post('/api/rate-video', (req, res) => {
  const { videoId, userId, action } = req.body;
  
  if (!videoId || !userId || !action) {
    return res.status(400).json({ error: 'Video ID, User ID, and action are required' });
  }
  
  if (action !== 'like' && action !== 'dislike') {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  let data = getVideoStats();
  data = getVideoEntry(videoId, data);
  
  const userInteractions = data[videoId].userInteractions || {};
  const previousAction = userInteractions[userId];
  
  // If user has already interacted, don't allow changes
  if (previousAction) {
    return res.json({
      likes: data[videoId].likes,
      dislikes: data[videoId].dislikes,
      views: data[videoId].views
    });
  }
  
  // Record the new interaction
  if (action === 'like') {
    data[videoId].likes += 1;
  } else {
    data[videoId].dislikes += 1;
  }
  
  userInteractions[userId] = action;
  data[videoId].userInteractions = userInteractions;
  
  saveVideoStats(data);
  
  res.json({
    likes: data[videoId].likes,
    dislikes: data[videoId].dislikes,
    views: data[videoId].views
  });
});

// API endpoint to check if user has already interacted
app.post('/api/user-interaction', (req, res) => {
  const { videoId, userId } = req.body;
  
  if (!videoId || !userId) {
    return res.status(400).json({ error: 'Video ID and User ID are required' });
  }
  
  const data = getVideoStats();
  const videoData = data[videoId];
  
  if (videoData && videoData.userInteractions && videoData.userInteractions[userId]) {
    res.json({
      hasInteracted: true,
      action: videoData.userInteractions[userId]
    });
  } else {
    res.json({
      hasInteracted: false
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
