# 🚀 GitHub Repository Setup Guide

## Step 1: Create Repository (MANUAL)

1. Go to **github.com** and log in
2. Click **"+" → "New repository"**
3. Repository name: `fitness-website`
4. Description: `Modern fitness tracking website with Supabase backend`
5. Make it **Public**
6. **DON'T** check any initialization options
7. Click **"Create repository"**

## Step 2: Connect Your Local Repository

After creating the repository on GitHub, run these commands in your terminal:

### Replace YOUR_USERNAME with your actual GitHub username:

```bash
# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fitness-website.git

# Rename main branch to main (GitHub default)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Step 3: Verify Upload

After pushing, you should see all your files on GitHub at:
`https://github.com/YOUR_USERNAME/fitness-website`

## Step 4: Deploy Options

### Option A: Vercel (Recommended)
1. Go to **vercel.com** and sign up with GitHub
2. Click **"New Project"**
3. Import your `fitness-website` repository
4. Configure:
   - Framework Preset: **Other**
   - Root Directory: `./` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
5. Click **"Deploy"**
6. Your site will be live at `yourproject.vercel.app`

### Option B: Netlify
1. Go to **netlify.com** and sign up with GitHub
2. Click **"New site from Git"**
3. Choose GitHub and authorize
4. Select your `fitness-website` repository
5. Configure:
   - Branch: `main`
   - Build command: Leave empty
   - Publish directory: `./` (root)
6. Click **"Deploy site"**
7. Your site will be live at a random URL (you can customize it)

### Option C: GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Source: **Deploy from a branch**
5. Branch: **main** / **/ (root)**
6. Click **Save**
7. Your site will be live at `YOUR_USERNAME.github.io/fitness-website`

## 🎯 Recommended: Vercel

Vercel is recommended because:
- ✅ Automatic deployments on every push
- ✅ Perfect for JavaScript/HTML projects
- ✅ Free SSL certificates
- ✅ Custom domain support
- ✅ Excellent performance
- ✅ Easy rollbacks

## 🔄 Automatic Deployments

Once connected to Vercel/Netlify:
1. Any changes you push to GitHub will automatically deploy
2. You'll get a live preview for each deployment
3. Easy rollback to previous versions
4. Branch previews for testing

## 📞 Need Help?

If you encounter any issues:
1. Check that your repository is public
2. Verify all files were pushed to GitHub
3. Check the deployment logs on your hosting platform
4. Ensure your Supabase credentials are correct 