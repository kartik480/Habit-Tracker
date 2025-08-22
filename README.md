# Habit Tracker Application

A comprehensive habit tracking application built with React.js frontend and Node.js backend, featuring real-time updates, progress visualization, and user authentication.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based login/registration system
- **Habit Management**: Create, edit, delete, and organize habits by categories
- **Progress Tracking**: Daily progress logging with completion status
- **Real-time Updates**: WebSocket integration for live data synchronization
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features
- **Progress Visualization**: Charts and analytics for habit performance
- **Reminder System**: Configurable reminders for habit completion
- **Category Organization**: Organize habits by health, fitness, learning, etc.
- **Progress Statistics**: Comprehensive analytics and insights
- **Filtering & Sorting**: Advanced habit and progress management

## 🛠️ Technology Stack

### Frontend
- **React.js 19** - Modern React with functional components and hooks
- **Redux Toolkit** - State management with async thunks
- **Material-UI (MUI)** - Beautiful, responsive UI components
- **Recharts** - Data visualization and charts
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Socket.io Client** - Real-time WebSocket communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Socket.io** - Real-time WebSocket server
- **Express Validator** - Input validation and sanitization
- **Bcrypt.js** - Password hashing

## 📁 Project Structure

```
HabbitTracker/
├── backend/                 # Backend API server
│   ├── models/             # MongoDB schemas
│   │   ├── User.js        # User model
│   │   ├── Habit.js       # Habit model
│   │   └── Progress.js    # Progress model
│   ├── routes/             # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── habits.js      # Habit management routes
│   │   └── progress.js    # Progress tracking routes
│   ├── middleware/         # Custom middleware
│   │   └── auth.js        # JWT authentication middleware
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth/      # Authentication components
│   │   │   ├── Dashboard/ # Dashboard components
│   │   │   ├── Habits/    # Habit management components
│   │   │   ├── Progress/  # Progress tracking components
│   │   │   ├── Analytics/ # Analytics and charts
│   │   │   ├── Profile/   # User profile components
│   │   │   └── Layout/    # Layout and navigation
│   │   ├── store/         # Redux store and slices
│   │   │   ├── slices/    # Redux Toolkit slices
│   │   │   └── index.js   # Store configuration
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and utility services
│   │   └── utils/         # Helper utilities
│   ├── package.json       # Frontend dependencies
│   └── public/            # Static assets
├── README.md              # Project documentation
├── SETUP.md               # Detailed setup instructions
└── PROJECT_OVERVIEW.md    # Project overview and requirements
```

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date
}
```

### Habit Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  category: String (enum: health, fitness, learning, etc.),
  frequency: String (enum: daily, weekly, monthly),
  targetValue: Number (default: 1),
  unit: String (max 20 chars),
  color: String (hex color),
  reminder: {
    enabled: Boolean,
    startTime: String (HH:MM),
    endTime: String (HH:MM),
    frequency: String,
    message: String (max 200 chars)
  },
  startDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  habitId: ObjectId (ref: Habit, required),
  user: ObjectId (ref: User, required),
  date: String (YYYY-MM-DD format, required),
  value: Number (default: 0),
  notes: String (max 500 chars),
  completed: Boolean (default: false),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HabbitTracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start          # Production
   npm run dev        # Development with nodemon
   ```

### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000

# Optional
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### MongoDB Setup
1. **Local MongoDB**
   - Install MongoDB Community Edition
   - Start MongoDB service
   - Create database: `habit-tracker`

2. **Cloud MongoDB (MongoDB Atlas)**
   - Create free cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get specific habit
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `PATCH /api/habits/:id/toggle-status` - Toggle habit status
- `GET /api/habits/stats/overview` - Get habit statistics

### Progress
- `GET /api/progress` - Get all progress
- `GET /api/progress/date/:date` - Get progress by date
- `GET /api/progress/habit/:habitId` - Get progress by habit
- `POST /api/progress` - Create/update progress
- `PUT /api/progress/:id` - Update progress
- `DELETE /api/progress/:id` - Delete progress
- `PATCH /api/progress/:id/toggle-completion` - Toggle completion
- `GET /api/progress/stats/overview` - Get progress statistics

## 🎯 Key Features Implementation

### Real-time Updates
- WebSocket integration using Socket.io
- Live habit and progress updates
- Real-time notifications

### Data Validation
- Backend validation using Express Validator
- Frontend form validation
- Input sanitization and security

### Responsive Design
- Mobile-first approach
- Material-UI responsive components
- Custom responsive utilities

### Progress Visualization
- Chart.js integration for analytics
- Progress tracking with visual feedback
- Completion rate calculations

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. **Prepare for deployment**
   ```bash
   cd backend
   npm run build
   ```

2. **Environment variables**
   - Set production `MONGODB_URI`
   - Set production `JWT_SECRET`
   - Configure `CORS_ORIGINS`

3. **Deploy to platform**
   - Railway: Connect GitHub repository
   - Heroku: Use Heroku CLI or GitHub integration

### Frontend Deployment (Vercel)
1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `build`

3. **Environment variables**
   - Set `REACT_APP_API_URL` to your backend URL

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Performance Features

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redux state management
- **Lazy Loading**: Component-based code splitting
- **Optimized Images**: WebP format support
- **Bundle Optimization**: Tree shaking and minification

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt encryption
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request handling
- **Rate Limiting**: API request throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request





## 🎉 Acknowledgments

- React.js team for the amazing framework
- Material-UI for beautiful components
- MongoDB for the database solution
- Express.js for the backend framework
- All contributors and users

---

**Built with ❤️ for the Habit Tracker Assignment**
