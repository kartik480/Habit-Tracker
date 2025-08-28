# 🚀 Heroku Deployment Guide

## 📋 **Prerequisites**
- [Heroku Account](https://signup.heroku.com/) (free tier available)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- [Git](https://git-scm.com/) installed
- Your project ready for deployment

## 🎯 **What We're Deploying**
- ✅ **Full Stack**: React frontend + Node.js backend on Heroku
- ✅ **Database**: MongoDB Atlas (cloud database)
- ✅ **Real-time**: WebSocket support

## 🚀 **Deploy to Heroku**

### **Method 1: Heroku CLI (Recommended)**

1. **Install Heroku CLI:**
   ```bash
   # Windows
   winget install --id=Heroku.HerokuCLI -e
   
   # Or download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Navigate to your project root:**
   ```bash
   cd E:\KartWebDesignDev\HabbitTracker
   ```

4. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

5. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
   heroku config:set MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.mongodb.net/habit-tracker?retryWrites=true&w=majority
   ```

6. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Open your app:**
   ```bash
   heroku open
   ```

### **Method 2: Heroku Dashboard**

1. **Go to [Heroku Dashboard](https://dashboard.heroku.com/)**
2. **Click "New" → "Create new app"**
3. **Connect your GitHub repository**
4. **Set buildpacks:**
   - Add `heroku/nodejs`
5. **Set environment variables in Settings tab:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.mongodb.net/habit-tracker?retryWrites=true&w=majority
   ```
6. **Enable automatic deploys from main branch**
7. **Click "Deploy Branch"**

## 🔧 **Configuration Details**

### **Environment Variables:**
- `NODE_ENV`: Set to `production`
- `JWT_SECRET`: Your secret key for JWT tokens
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `PORT`: Heroku sets this automatically

### **Build Process:**
1. **Install dependencies** for both frontend and backend
2. **Build React app** (`npm run build`)
3. **Start Node.js server** with static file serving

### **File Structure on Heroku:**
```
/
├── api/          # Backend API endpoints
├── static/       # React build files
└── index.html    # React app entry point
```

## 🌐 **After Deployment**

- **Frontend**: Your Heroku URL (e.g., `https://your-app-name.herokuapp.com`)
- **Backend API**: `https://your-app-name.herokuapp.com/api`
- **Health Check**: `https://your-app-name.herokuapp.com/api/health`

## 📱 **Test Your Deployment**

1. **Visit your Heroku URL**
2. **Try to register/login**
3. **Create a habit**
4. **Check if data is saved**
5. **Test real-time updates**

## 🚨 **Troubleshooting**

### **Build Fails:**
1. Check Heroku build logs: `heroku logs --tail`
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### **App Crashes:**
1. Check runtime logs: `heroku logs --tail`
2. Verify environment variables are set
3. Check MongoDB connection

### **Frontend Not Loading:**
1. Ensure `heroku-postbuild` script runs successfully
2. Check if React build files are generated
3. Verify static file serving is configured

## 🔄 **Automatic Deployments**

- **GitHub Integration**: Enable automatic deploys from main branch
- **Manual Deploy**: `git push heroku main`

## 📊 **Monitoring**

- **Logs**: `heroku logs --tail`
- **Status**: `heroku ps`
- **Metrics**: Heroku dashboard

## 💰 **Pricing**

- **Free Tier**: No longer available
- **Basic Dyno**: $7/month (recommended for production)
- **Standard Dyno**: $25/month (better performance)

## 🎉 **You're All Set!**

Your Habit Tracker will be fully deployed on Heroku with:
- **Frontend**: React app served by Express
- **Backend**: Node.js/Express API
- **Database**: MongoDB Atlas
- **Real-time**: WebSocket support
- **Single URL**: Everything accessible from one domain

---

## 🚀 **Quick Deploy Commands**

```bash
# Create and deploy
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
heroku open
```
