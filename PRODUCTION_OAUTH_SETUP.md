# Production Google OAuth Setup Guide

## 🚨 CRITICAL: Google Cloud Console Configuration

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API and Google Identity API

### Step 2: Configure OAuth 2.0 Client
1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure authorized JavaScript origins:
   ```
   http://localhost:3000 (for development)
   https://yourdomain.com (for production)
   ```
5. Configure authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback (for development)
   https://yourdomain.com/auth/callback (for production)
   ```

### Step 3: Get Credentials
1. Copy the Client ID (looks like: `123456789-abcdef.apps.googleusercontent.com`)
2. Copy the Client Secret (keep this secure!)

## 🔧 Environment Configuration

### Frontend Environment (.env)
Create `frontend/.env`:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
REACT_APP_API_URL=http://localhost:8000
```

### Backend Environment (.env)
Create `backend/.env`:
```bash
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
SECRET_KEY=your_jwt_secret_key_here
DATABASE_URL=sqlite:///./hiring_platform.db
```

## 🚀 Production Deployment Variables

### For Google Cloud Platform:
```bash
GOOGLE_CLIENT_ID=production_client_id
GOOGLE_CLIENT_SECRET=production_client_secret
SECRET_KEY=production_jwt_secret
DATABASE_URL=postgresql://user:pass@host:port/dbname
ENVIRONMENT=production
```

## ✅ Verification Steps

### 1. Test Google OAuth Flow
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm start`
3. Click "Start Free Trial" → Should show real Google OAuth popup
4. Sign in with real Google account
5. Should redirect to dashboard with real user data

### 2. Verify Database Integration
1. Check that user is created in database
2. Verify Google ID, email, and profile data are stored
3. Test session persistence across browser refreshes

### 3. Security Verification
1. Verify JWT tokens are properly signed
2. Check that sessions expire after 24 hours
3. Test logout functionality clears all data

## 🛡️ Security Best Practices

### Environment Variables
- Never commit `.env` files to git
- Use different credentials for development/production
- Rotate secrets regularly

### Token Security
- JWT tokens expire in 24 hours
- Store securely in localStorage (production apps should use httpOnly cookies)
- Clear all auth data on logout

### Domain Security
- Configure authorized domains in Google Cloud Console
- Use HTTPS in production
- Set proper CORS policies

## 🔍 Troubleshooting

### Common Issues:

1. **"Google OAuth not configured"**
   - Ensure `GOOGLE_CLIENT_ID` is set in backend environment
   - Check that Google Cloud Console has OAuth configured

2. **"Invalid Google token"**
   - Verify Client ID matches between frontend and backend
   - Check that domain is authorized in Google Cloud Console

3. **"Authentication failed"**
   - Check database connection
   - Verify JWT secret is set
   - Check network connectivity to Google APIs

### Debug Steps:
1. Check browser console for JavaScript errors
2. Check backend logs for authentication errors
3. Verify environment variables are loaded
4. Test with different Google accounts

## 📋 Production Checklist

- [ ] Google Cloud Project created
- [ ] OAuth 2.0 client configured with production domains
- [ ] Environment variables set for frontend and backend
- [ ] Real Google accounts tested successfully
- [ ] Database stores user data correctly
- [ ] Sessions work across browser refreshes
- [ ] Logout clears all authentication data
- [ ] No mock/testing elements remain in production code
- [ ] HTTPS configured for production deployment
- [ ] Error handling implemented for auth failures

## 🎯 Final Verification

### Landing Page Should Show:
- "Start Free Trial" button (not "with Google")
- Real Google OAuth popup when clicked
- Professional user experience

### Dashboard Should Show:
- Real user data (name, email, profile picture)
- All 9 agent tabs functional
- No mock/testing messages anywhere

**NO MOCK ELEMENTS SHOULD REMAIN IN PRODUCTION CODE**