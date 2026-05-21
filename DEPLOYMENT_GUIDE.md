# 🚀 Deployment Guide

## Production URLs
- **Frontend (Vercel)**: https://fse-project-azure.vercel.app/
- **Backend (Render)**: https://fse-project-2.onrender.com

---

## 🔧 Backend Deployment (Render)

### Environment Variables to Set on Render:

```bash
# Server
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string_here

# JWT / Session
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# URLs (IMPORTANT!)
CLIENT_URL=https://fse-project-azure.vercel.app
SERVER_URL=https://fse-project-2.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# PhonePe Payment Gateway
PHONEPE_CLIENT_ID=your_phonepe_client_id_here
PHONEPE_CLIENT_SECRET=your_phonepe_client_secret_here
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
```

### Render Settings:
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Root Directory**: Leave empty (or set to `/`)

---

## 🎨 Frontend Deployment (Vercel)

### Environment Variables to Set on Vercel:

```bash
# Backend API URL (IMPORTANT!)
NEXT_PUBLIC_API_URL=https://fse-project-2.onrender.com/api
```

### Vercel Settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: Leave empty (or set to `/`)

---

## ⚠️ Important Configuration Steps

### 1. Google OAuth Redirect URIs
Add these to your Google Cloud Console:
- `https://fse-project-2.onrender.com/api/auth/google/callback`
- `https://fse-project-azure.vercel.app/auth/callback`

Go to: https://console.cloud.google.com/apis/credentials

### 2. MongoDB Atlas Network Access
Make sure MongoDB allows connections from:
- `0.0.0.0/0` (Allow from anywhere) - for Render and Vercel

Go to: https://cloud.mongodb.com → Network Access

### 3. CORS Configuration
The backend already allows:
- Your Vercel domain
- All `.vercel.app` subdomains
- Requests with no origin (for mobile apps)

---

## 🐛 Common Deployment Issues & Fixes

### Issue 1: CORS Errors
**Symptom**: Frontend can't connect to backend
**Fix**: 
- Verify `CLIENT_URL` on Render matches your Vercel URL exactly
- Check browser console for exact error
- Make sure no trailing slashes in URLs

### Issue 2: Google OAuth Not Working
**Symptom**: "redirect_uri_mismatch" error
**Fix**:
- Add production callback URLs to Google Console
- Wait 5 minutes for Google to propagate changes
- Clear browser cache

### Issue 3: MongoDB Connection Failed
**Symptom**: Backend crashes on startup
**Fix**:
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify connection string is correct
- Check MongoDB Atlas cluster is running

### Issue 4: PhonePe Payment Fails
**Symptom**: Payment initiation returns error
**Fix**:
- Verify PhonePe credentials are correct
- Make sure `PHONEPE_ENV=SANDBOX` for testing
- Check PhonePe dashboard for API status
- If not configured, app will allow free generations

### Issue 5: Images Not Generating
**Symptom**: Image generation fails
**Fix**:
- Pollinations.ai requires no API key
- Check if Pollinations.ai is accessible from Render
- Verify no firewall blocking external API calls
- Check Render logs for specific errors

### Issue 6: Render Cold Starts
**Symptom**: First request takes 30+ seconds
**Fix**:
- This is normal for Render free tier
- Consider upgrading to paid plan for instant wake
- Or use a cron job to ping your backend every 10 minutes

---

## 📊 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://fse-project-2.onrender.com/api/health
```
Should return: `{"status":"ok","timestamp":"...","uptime":...}`

### 2. Test Frontend
Visit: https://fse-project-azure.vercel.app/
- Should load without errors
- Check browser console for any errors

### 3. Test Image Generation
- Login to your app
- Try generating an ad
- Check if Pollinations.ai URL appears in logs

### 4. Test Payment Flow
- Try generating a second ad
- Payment modal should appear
- PhonePe redirect should work (if configured)

---

## 🔍 Debugging Tips

### View Render Logs:
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors in red

### View Vercel Logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Click "Deployments"
4. Click on latest deployment
5. Click "Functions" tab for API route logs

### Check Environment Variables:
- **Render**: Settings → Environment
- **Vercel**: Settings → Environment Variables

---

## 🎯 Deployment Checklist

### Before Deploying:
- [ ] Update Google OAuth redirect URIs
- [ ] Configure MongoDB Network Access
- [ ] Set all environment variables on Render
- [ ] Set all environment variables on Vercel
- [ ] Test locally with production URLs

### After Deploying:
- [ ] Test backend health endpoint
- [ ] Test frontend loads
- [ ] Test user registration/login
- [ ] Test Google OAuth login
- [ ] Test image generation
- [ ] Test payment flow (if PhonePe configured)
- [ ] Check all logs for errors

---

## 📝 Notes

### Pollinations.ai
- Completely free, no API key needed
- Works out of the box
- No rate limits for reasonable use
- Uses Flux model for high-quality images

### PhonePe Payments
- Optional - app works without it
- If not configured, all generations are free
- Sandbox mode for testing
- Switch to PRODUCTION mode when ready

### Free Tier Limitations
- **Render**: Cold starts after 15 min inactivity
- **Vercel**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage

---

## 🆘 Need Help?

If you encounter issues:
1. Check the logs (Render/Vercel dashboards)
2. Verify all environment variables are set correctly
3. Test each component individually
4. Check this guide for common issues

Good luck with your deployment! 🚀
