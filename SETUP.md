# 🚀 Habit Tracker Setup Guide

This guide will walk you through setting up the Habit Tracker application step by step.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud instance) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** (comes with Node.js)

### Verify Installation
```bash
node --version    # Should be v16 or higher
npm --version     # Should be 6 or higher
git --version     # Should be 2.0 or higher
```

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   - **Windows**: Download and run the installer from MongoDB website
   - **macOS**: Use Homebrew: `brew install mongodb-community`
   - **Linux**: Follow distribution-specific instructions

2. **Start MongoDB Service**
   ```bash
   # Windows (run as administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Verify Connection**
   ```bash
   mongosh
   # You should see the MongoDB shell
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🚀 Application Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HabbitTracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Create Environment File**
```bash
cp env.example .env
```

**Edit `.env` file:**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/habit-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Start Backend Server**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

**Verify Backend**
- Open browser to `http://localhost:5000/api/health`
- You should see: `{"message":"Habit Tracker API is running!","timestamp":"...","version":"1.0.0"}`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Create Environment File**
```bash
# Create .env file in frontend directory
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

**Start Frontend Development Server**
```bash
npm start
```

**Verify Frontend**
- Browser should automatically open to `http://localhost:3000`
- You should see the login/register page

## 🔧 Configuration Details

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `PORT` | Server port number | No | 5000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `CORS_ORIGINS` | Allowed CORS origins | No | http://localhost:3000 |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API base URL | Yes | - |

### MongoDB Connection String Format

**Local MongoDB:**
```
mongodb://localhost:27017/habit-tracker
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority
```

## 🧪 Testing the Setup

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test registration (replace with your data)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test Frontend

1. Open `http://localhost:3000` in your browser
2. Click "Register" to create a new account
3. Fill in the registration form
4. Submit and verify you're redirected to the dashboard

### 3. Test Database Connection

1. Check backend console for MongoDB connection messages
2. Look for: `✅ MongoDB connected successfully`
3. If using MongoDB Atlas, verify network access allows your IP

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:** `MongoServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB service is running
- Check if MongoDB is listening on the correct port
- Verify connection string format

```bash
# Check MongoDB status
# Windows
net start MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

#### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
- Change the port in `.env` file
- Kill the process using the port

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### 3. CORS Errors

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions:**
- Check CORS_ORIGINS in backend `.env`
- Ensure frontend URL is included in CORS origins
- Restart backend server after changing CORS settings

#### 4. JWT Token Errors

**Error:** `JsonWebTokenError: invalid token`

**Solutions:**
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Ensure JWT_SECRET is a strong, random string

#### 5. Frontend Build Errors

**Error:** `Module not found: Can't resolve '...'`

**Solutions:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check if all dependencies are properly installed

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Security Considerations

### Development Environment

1. **JWT Secret**: Use a strong, random string
2. **Database**: Use local MongoDB or secure cloud instance
3. **CORS**: Limit to necessary origins only

### Production Environment

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use cryptographically secure random strings
3. **Database**: Use MongoDB Atlas with proper security
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs

## 📱 Mobile Testing

### Responsive Design Testing

1. **Browser DevTools**
   - Open DevTools (F12)
   - Click device toggle button
   - Test different screen sizes

2. **Real Devices**
   - Test on actual mobile devices
   - Check touch interactions
   - Verify responsive behavior

## 🚀 Deployment Preparation

### Backend Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS origins for production domain
- [ ] Set up environment variables on hosting platform
- [ ] Test production build locally

### Frontend Deployment Checklist

- [ ] Set `REACT_APP_API_URL` to production backend URL
- [ ] Build production version: `npm run build`
- [ ] Test production build locally
- [ ] Deploy `build` folder to hosting platform

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Redux Toolkit Tutorial](https://redux-toolkit.js.org/tutorials/quick-start)
- [Material-UI Components](https://mui.com/components/)

## 🆘 Getting Help

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify all prerequisites** are installed correctly
3. **Check environment variables** are set properly
4. **Review the troubleshooting section** above
5. **Create an issue** in the repository
6. **Contact support**: nisakshtechnologiespvtltd@gmail.com

---

**Happy coding! 🎉**
