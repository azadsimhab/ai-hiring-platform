// Authentication Service for Google OAuth and User Management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = null;
    this.refreshPromise = null;
    this.sessionTimeout = null;
    this.initializeSessionTimeout();
  }

  // Initialize session timeout management
  initializeSessionTimeout() {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (sessionExpiry) {
      const timeLeft = parseInt(sessionExpiry) - Date.now();
      if (timeLeft > 0) {
        this.setSessionTimeout(timeLeft);
      } else {
        this.logout();
      }
    }
  }

  // Set session timeout
  setSessionTimeout(duration = 24 * 60 * 60 * 1000) { // 24 hours default
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    this.sessionTimeout = setTimeout(() => {
      this.logout();
    }, duration);
    
    localStorage.setItem('sessionExpiry', (Date.now() + duration).toString());
  }

  // Google OAuth login initiation - Now handled by GoogleOAuthButton
  async initiateGoogleLogin() {
    try {
      // Clear any existing session data first
      this.logout();
      
      // In production, OAuth is handled by GoogleOAuthButton component
      // This method is kept for backward compatibility
      const state = this.generateStateToken();
      localStorage.setItem('oauthState', state);
      
      throw new Error('Please use the Google Sign-in button to authenticate');
    } catch (error) {
      console.error('Google login initiation failed:', error);
      throw new Error('Please use the Google Sign-in button to authenticate');
    }
  }

  // Generate secure state token for OAuth
  generateStateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate OAuth state token
  validateStateToken(receivedState) {
    const storedState = localStorage.getItem('oauthState');
    localStorage.removeItem('oauthState');
    return storedState === receivedState;
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code, state) {
    try {
      // Validate state token to prevent CSRF attacks
      if (!this.validateStateToken(state)) {
        throw new Error('Invalid OAuth state. Possible CSRF attack detected.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `OAuth callback failed (${response.status})`);
      }

      const data = await response.json();
      
      // Validate required fields
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from authentication server');
      }

      // Store authentication data securely
      this.token = data.access_token;
      this.user = this.sanitizeUserData(data.user);
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      // Set session timeout
      this.setSessionTimeout();
      
      return data;
    } catch (error) {
      console.error('Google OAuth callback failed:', error);
      this.logout(); // Clear any partial data
      throw error;
    }
  }

  // Sanitize user data for security
  sanitizeUserData(userData) {
    const allowedFields = ['id', 'name', 'email', 'company', 'google_id', 'role', 'profile_picture_url'];
    const sanitized = {};
    
    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        sanitized[field] = typeof userData[field] === 'string' 
          ? userData[field].trim() 
          : userData[field];
      }
    });
    
    return sanitized;
  }

  // Get current user
  getCurrentUser() {
    if (!this.user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    }
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.getCurrentUser();
  }

  // Logout user
  logout() {
    // Clear session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    
    // Clear all authentication data
    this.token = null;
    this.user = null;
    
    // Remove all auth-related items from localStorage
    const authKeys = ['authToken', 'user', 'sessionExpiry', 'oauthState', 'refreshToken'];
    authKeys.forEach(key => localStorage.removeItem(key));
    
    // Cancel any pending refresh attempts
    if (this.refreshPromise) {
      this.refreshPromise = null;
    }
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Verify token with backend
  async verifyToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.logout();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();