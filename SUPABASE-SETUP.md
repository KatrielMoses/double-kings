# Supabase Google OAuth Setup

To fix the Google sign-in functionality, you need to configure Google OAuth in your Supabase project.

## Step 1: Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `xpfnxpbshviqqukjrrub`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and toggle it **ON**
5. You'll need to configure these settings:

### Required Configuration:

**Client ID**: (You'll need to create this in Google Cloud Console)
**Client Secret**: (You'll need to create this in Google Cloud Console)

**Redirect URL**: Copy this URL from Supabase:
```
https://xpfnxpbshviqqukjrrub.supabase.co/auth/v1/callback
```

## Step 2: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen:
   - App name: "Double Kings Fitness"
   - User support email: Your email
   - Developer contact: Your email

### OAuth 2.0 Client Configuration:

**Application type**: Web application
**Name**: Double Kings Fitness
**Authorized JavaScript origins**:
```
https://double-kings-pzhb.vercel.app
http://localhost:3001
```

**Authorized redirect URIs**:
```
https://xpfnxpbshviqqukjrrub.supabase.co/auth/v1/callback
```

## Step 3: Copy Credentials Back to Supabase

1. Copy the **Client ID** from Google Cloud Console
2. Copy the **Client Secret** from Google Cloud Console
3. Paste both into your Supabase Google provider settings
4. Save the configuration

## Step 4: Test the Integration

Once configured, the Google sign-in buttons should work:
- Users can sign in with their Google accounts
- User profiles are automatically created in Supabase
- Authentication state is managed by Supabase

## Troubleshooting

If Google sign-in still doesn't work:

1. **Check the browser console** for error messages
2. **Verify redirect URLs** match exactly between Google and Supabase
3. **Ensure the Google+ API is enabled** in Google Cloud Console
4. **Check that your domain is authorized** in both systems

## Current Status

✅ **Frontend Code**: Ready for Google OAuth
✅ **Supabase Integration**: Configured for Google sign-in
⏳ **Google Cloud Setup**: Needs to be completed by you
⏳ **Supabase Provider Config**: Needs Google credentials

Once you complete the Google Cloud Console setup and add the credentials to Supabase, Google sign-in will work seamlessly! 