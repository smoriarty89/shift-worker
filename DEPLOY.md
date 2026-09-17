# How to deploy Shift Worker

This takes about 20 minutes. Everything is free.

---

## Step 1 - Get a GitHub account
Go to github.com and sign up if you don't have one.

## Step 2 - Upload the code to GitHub
1. Go to github.com/new
2. Name the repo: shift-worker
3. Make it Private
4. Click "Create repository"
5. Click "uploading an existing file"
6. Upload ALL the files from this folder (keep the folder structure)
7. Click "Commit changes"

## Step 3 - Get a Vercel account
1. Go to vercel.com
2. Click "Sign up" and sign up with your GitHub account

## Step 4 - Deploy to Vercel
1. In Vercel, click "Add New Project"
2. Find your "shift-worker" repo and click "Import"
3. Click "Deploy" (leave all settings as default)
4. Wait about 1 minute - it will give you a URL like shift-worker.vercel.app

## Step 5 - Add the database (Vercel KV)
1. In your Vercel project, click the "Storage" tab
2. Click "Create Database"
3. Choose "KV" (Redis)
4. Name it anything, click Create
5. Click "Connect to Project" and connect it to your shift-worker project
6. Vercel automatically adds the database credentials - nothing else needed

## Step 6 - Add your Anthropic API key
1. In your Vercel project, click "Settings" then "Environment Variables"
2. Add a new variable:
   - Name: ANTHROPIC_API_KEY
   - Value: your key starting with sk-ant-...
3. Click Save
4. Go to "Deployments" and click "Redeploy" on your latest deployment

## Step 7 - Done!
Your app is live at your Vercel URL. Share it with anyone - no Claude account needed.

---

## Your files explained
- public/index.html - the whole app
- api/scan.js - AI roster scanning
- api/group.js - create/get groups
- api/join.js - join a group
- api/members.js - list members
- api/availability.js - save availability
- api/results.js - calculate overlapping days
- vercel.json - routing config
- package.json - dependencies
