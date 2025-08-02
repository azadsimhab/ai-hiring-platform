// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com",
  redirectUri: process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/auth/callback",
  scopes: [
    'openid',
    'profile', 
    'email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.file'
  ]
};

// OAuth login URL generator
export const getGoogleOAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};