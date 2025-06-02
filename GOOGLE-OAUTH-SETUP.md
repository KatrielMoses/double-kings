# 🔐 Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. **Project name:** `Double Kings Fitness`
4. Click **"Create"**

### 1.2 Enable APIs
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Identity"**
3. Click **"Google Identity"** → **"Enable"**

### 1.3 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** → **"Create"**
3. Fill in required fields:
   - **App name:** `Double Kings Fitness`
   - **User support email:** Your email
   - **Developer contact email:** Your email
4. Click **"Save and Continue"** through all steps

### 1.4 Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. **Application type:** `Web application`
4. **Name:** `Double Kings Fitness Web`
5. **Authorized JavaScript origins:**
   ```
   https://dsw2vjo7jrzh1.cloudfront.net
   http://localhost:8080
   http://localhost:8000
   http://localhost:3000
   ```
6. **Authorized redirect URIs:**
   ```
   https://dsw2vjo7jrzh1.cloudfront.net
   http://localhost:8080
   http://localhost:8000
   http://localhost:3000
   ```
7. Click **"Create"**
8. **📋 COPY THE CLIENT ID** - you'll need this!

## Step 2: Update Your Website

### 2.1 Add Client ID to Configuration
1. Open `js/google-config.js`
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```javascript
   CLIENT_ID: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
   ```

### 2.2 Example Configuration
```javascript
const GOOGLE_CONFIG = {
    CLIENT_ID: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Your actual Client ID
    AUTHORIZED_DOMAINS: [
        'https://dsw2vjo7jrzh1.cloudfront.net',
        'http://localhost:8080'
    ],
    SCOPES: 'email profile',
    UX_MODE: 'popup',
    AUTO_SELECT: false,
    CANCEL_ON_TAP_OUTSIDE: true
};
```

## Step 3: Deploy and Test

### 3.1 Deploy to AWS
```bash
aws s3 sync . s3://double-kings-fitness-app --exclude "*.md" --exclude "backend/*" --exclude "node_modules/*"
aws cloudfront create-invalidation --distribution-id E2GR7PIWRHSBPZ --paths "/*"
```

### 3.2 Test Google OAuth
1. Visit: https://dsw2vjo7jrzh1.cloudfront.net
2. Click **"Sign in with Google"**
3. Should open Google OAuth popup
4. Sign in with your Google account
5. Should automatically log you into the fitness app

## 🔧 Troubleshooting

### Problem: "Error 400: redirect_uri_mismatch"
**Solution:** Make sure the redirect URIs in Google Cloud Console EXACTLY match your domain:
- `https://dsw2vjo7jrzh1.cloudfront.net` (no trailing slash)

### Problem: "Error 403: access_blocked"
**Solution:** 
1. Your OAuth consent screen might be in "Testing" mode
2. Add your email as a test user in Google Cloud Console
3. Or publish the app (requires verification for production)

### Problem: Still showing demo popup
**Solution:**
1. Check browser console for errors
2. Make sure `CLIENT_ID` is updated in `js/google-config.js`
3. Clear browser cache and reload

### Problem: "Failed to load Google Identity Services"
**Solution:**
1. Check internet connection
2. Make sure the domain is authorized in Google Cloud Console
3. Check for browser ad blockers blocking Google scripts

## 📋 Quick Checklist

- [ ] Google Cloud project created
- [ ] Google Identity API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied from Google Cloud Console
- [ ] Client ID updated in `js/google-config.js`
- [ ] Authorized domains added to Google Cloud Console
- [ ] Website deployed to AWS
- [ ] CloudFront cache invalidated
- [ ] Google sign-in tested

## 🎯 Final Result

Once configured correctly:
- ✅ Real Google OAuth (no demo popup)
- ✅ Users can sign in with their Google accounts
- ✅ User info automatically saved to localStorage
- ✅ Seamless authentication experience
- ✅ Still 100% FREE (no server costs)

## 💡 Security Notes

- Client-side OAuth is safe for public websites
- No client secrets needed (public client)
- User data stored locally in browser
- No server-side authentication required
- Perfect for static websites like yours

Your website will now have **real Google OAuth** while maintaining the **$0/month cost**! 🎉 