#!/bin/bash

echo "🚀 Habit Tracker Deployment Script"
echo "=================================="

# Frontend deployment
echo "📱 Deploying Frontend to Vercel..."
cd frontend
npm run build
vercel --prod
cd ..

echo ""
echo "🔧 Backend Deployment Options:"
echo "1. Heroku (requires account verification)"
echo "2. Railway (alternative)"
echo ""

echo "📋 Next Steps:"
echo "1. Verify your Heroku account at: https://heroku.com/verify"
echo "2. Create a MongoDB Atlas cluster at: https://cloud.mongodb.com"
echo "3. Run the backend deployment commands from DEPLOYMENT_GUIDE.md"
echo ""

echo "✅ Frontend deployed successfully!"
echo "🌐 Live URL: https://htrackerfinal-3beeaa1uw-karthikreddys-projects.vercel.app"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for complete instructions"
