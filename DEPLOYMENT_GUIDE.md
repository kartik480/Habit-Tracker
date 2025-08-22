# 🚀 Habit Tracker Deployment Guide

## ✅ Frontend - Successfully Deployed to Vercel

**Live URL:** https://htrackerfinal-3beeaa1uw-karthikreddys-projects.vercel.app

**Deployment Status:** ✅ Complete

## 🔧 Backend - Heroku Deployment

### Prerequisites
1. **Heroku Account Verification Required**
   - Visit: https://heroku.com/verify
   - Add payment information to verify your account
   - This is required for creating new apps

### Deployment Steps

#### 1. Create Heroku App
```bash
cd backend
heroku create habit-tracker-backend-api
```

#### 2. Set Environment Variables
```bash
# MongoDB URI (you'll need a MongoDB Atlas cluster)
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"

# JWT Secret
heroku config:set JWT_SECRET="your-super-secret-jwt-key-here"

# Node Environment
heroku config:set NODE_ENV="production"

# CORS Origins
heroku config:set CORS_ORIGINS="https://htrackerfinal-3beeaa1uw-karthikreddys-projects.vercel.app"
```

#### 3. Deploy to Heroku
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

#### 4. Verify Deployment
```bash
heroku open
# Or visit: https://your-app-name.herokuapp.com/api/health
```

### Alternative: Railway Deployment

Since you already have a `railway.toml` file, you can also deploy to Railway:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

## 🔗 Update Frontend API URLs

After deploying the backend, update your frontend environment variables:

1. **Create `.env` file in frontend directory:**
   ```env
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   # or
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

2. **Redeploy frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

## 📊 Current Status

- ✅ **Frontend:** Deployed to Vercel
- ⏳ **Backend:** Ready for deployment (requires Heroku account verification)
- 🔄 **Database:** MongoDB Atlas connection needed
- 🔐 **Environment Variables:** Configured in code

## 🚨 Important Notes

1. **MongoDB Atlas:** You'll need a MongoDB Atlas cluster for production
2. **Environment Variables:** Never commit sensitive data to Git
3. **CORS:** Backend is configured to accept requests from your Vercel domain
4. **WebSocket:** Real-time features will work once backend is deployed

## 🆘 Troubleshooting

### Heroku Issues
- **Account Verification:** Must add payment info to create apps
- **Build Failures:** Check `heroku logs --tail`
- **Environment Variables:** Verify with `heroku config`

### Vercel Issues
- **Build Warnings:** Current warnings don't affect functionality
- **API Calls:** Ensure backend URL is correct in environment variables

## 📞 Support

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Heroku Dashboard:** https://dashboard.heroku.com
- **MongoDB Atlas:** https://cloud.mongodb.com
