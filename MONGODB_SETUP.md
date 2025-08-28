# MongoDB Setup Guide

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Make sure to install MongoDB as a service
4. MongoDB will run on `mongodb://localhost:27017`

### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

## Option 3: Use Docker

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Connect to MongoDB
docker exec -it mongodb mongosh
```

## Testing the Connection

After setting up MongoDB, test the connection:

1. Start your backend server: `cd backend && npm start`
2. Check the console for MongoDB connection status
3. Test the health endpoint: `http://localhost:5000/api/health`

## Troubleshooting

### Port 27017 already in use:
```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :27017
kill -9 <PID>
```

### MongoDB service not starting:
- Check MongoDB logs
- Ensure data directory exists and has proper permissions
- Verify MongoDB configuration file

## Next Steps

Once MongoDB is running:
1. Your backend server will connect automatically
2. The frontend will be able to communicate with the backend
3. You can create users and start tracking habits

## Environment Variables

Create a `.env` file in the backend directory:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/habit-tracker

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```
