# Deployment Guide — Vercel Frontend Deployment

This guide explains how to deploy the React frontend to Vercel (free tier).

---

## Prerequisites

- [Node.js](https://nodejs.org) 18+ installed
- [Vercel account](https://vercel.com) (free — sign up with GitHub)
- Your Google Apps Script Web App URL
- Git installed

---

## Option A: Deploy via Vercel CLI (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Build and deploy

```bash
cd attendance-tracker/frontend

# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy (interactive — follow the prompts)
vercel

# For production deployment:
vercel --prod
```

### 3. Set Environment Variables on Vercel

During the CLI deployment, Vercel will ask about environment variables.
Or set them via the Vercel Dashboard:

1. Go to your project on [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Settings → Environment Variables**
3. Add:
   | Key          | Value                                          | Environment |
   |--------------|------------------------------------------------|-------------|
   | VITE_API_URL | `https://script.google.com/macros/s/.../exec` | Production  |

4. **Redeploy** after adding variables:
   ```bash
   vercel --prod
   ```

---

## Option B: Deploy via GitHub (Auto-Deploy)

### 1. Push to GitHub

```bash
cd attendance-tracker
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracker.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. **Import** your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` = your Apps Script URL
5. Click **Deploy**

### 3. Auto-deployments

Every `git push` to `main` will automatically trigger a new Vercel deployment.

---

## Vercel Project Settings

| Setting           | Value         |
|-------------------|---------------|
| Framework         | Vite          |
| Root Directory    | `frontend/`   |
| Build Command     | `npm run build` |
| Output Directory  | `dist`        |
| Install Command   | `npm install` |

---

## Custom Domain (Optional)

1. In Vercel Dashboard → **Settings → Domains**
2. Add your custom domain (e.g., `attendance.yourcompany.com`)
3. Update your DNS records as instructed by Vercel

---

## Post-Deployment Checklist

- [ ] Visit the deployed URL and log in
- [ ] Verify the dashboard loads (may show empty data until agent sends first heartbeat)
- [ ] Test Excel download
- [ ] Test dark mode toggle
- [ ] Share the URL with both users

---

## Updating the App

After making code changes:

```bash
cd frontend
git add .
git commit -m "Update: description of change"
git push
```

Vercel auto-deploys within ~1 minute.

Or manually re-deploy:
```bash
vercel --prod
```
