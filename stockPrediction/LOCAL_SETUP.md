# 🚀 StockPrediction - Local Development Setup

This guide will help you set up and run the StockPrediction application locally on your machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download here](https://python.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://postgresql.org/)
- **Redis** (v6 or higher) - [Download here](https://redis.io/)
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
stockPrediction/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── deployment/       # Docker configs
└── docs/            # Documentation
```

## ⚡ Quick Start

### 1. **Backend Setup**

```bash
# Navigate to backend directory
cd stockPrediction/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env file with your settings
nano .env
```

### 2. **Database Setup**

```bash
# Start PostgreSQL service
# On macOS with Homebrew:
brew services start postgresql

# Create database
createdb stockprediction

# Create user (optional)
psql -c "CREATE USER stockprediction WITH PASSWORD 'password123';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE stockprediction TO stockprediction;"
```

### 3. **Redis Setup**

```bash
# Start Redis service
# On macOS with Homebrew:
brew services start redis

# Or run directly:
redis-server
```

### 4. **Start Backend**

```bash
# From backend directory
cd stockPrediction/backend

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**
- API documentation: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/health**

### 5. **Frontend Setup**

```bash
# Navigate to frontend directory
cd stockPrediction/frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at: **http://localhost:3000**

## 🔧 Configuration

### Backend Environment Variables (`.env`)

```bash
# Application
APP_NAME=StockPrediction
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql://stockprediction:password123@localhost:5432/stockprediction

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

Create `stockPrediction/frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENVIRONMENT=development
```

## 🧪 Testing the Setup

### 1. **Backend Health Check**

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "StockPrediction",
  "version": "1.0.0"
}
```

### 2. **Frontend Access**

Open your browser and go to: **http://localhost:3000**

You should see the StockPrediction dashboard.

### 3. **API Integration Test**

Try searching for a stock (e.g., "AAPL") in the frontend dashboard. The app should:
- Fetch stock data
- Display sentiment analysis
- Show predictions
- Allow adding to watchlist

## 🚀 Development Workflow

### Running Both Services

**Terminal 1 (Backend):**
```bash
cd stockPrediction/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd stockPrediction/frontend
npm start
```

**Terminal 3 (Database/Redis):**
```bash
# Start PostgreSQL
brew services start postgresql

# Start Redis
brew services start redis
```

### Making Changes

1. **Backend changes**: The server will auto-reload thanks to `--reload` flag
2. **Frontend changes**: React will hot-reload automatically
3. **Database changes**: Restart backend after schema modifications

## 📊 Sample Data

The application includes mock data for development:

- **Stock prices**: Fetched from Yahoo Finance API
- **Sentiment data**: Generated mock sentiment scores
- **Predictions**: ML model predictions (mock data)
- **News**: Sample news articles with sentiment

## 🔍 API Endpoints

### Stock Data
- `GET /api/v1/stocks/search?query=AAPL` - Search stocks
- `GET /api/v1/stocks/AAPL` - Get stock details
- `GET /api/v1/stocks/AAPL/price` - Get current price
- `GET /api/v1/stocks/market/overview` - Market overview

### Sentiment Analysis
- `GET /api/v1/sentiment/AAPL` - Get sentiment
- `GET /api/v1/sentiment/AAPL/news` - News sentiment
- `GET /api/v1/sentiment/AAPL/social` - Social sentiment

### Predictions
- `GET /api/v1/predictions/AAPL` - Get predictions
- `POST /api/v1/predictions/AAPL/predict` - Generate prediction

### Portfolio
- `GET /api/v1/portfolio/` - Get portfolio
- `GET /api/v1/portfolio/watchlist` - Get watchlist
- `POST /api/v1/portfolio/watchlist/add` - Add to watchlist

## 🐛 Troubleshooting

### Common Issues

**1. Backend won't start**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

**2. Database connection error**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Check database exists
psql -l | grep stockprediction
```

**3. Frontend build errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. CORS errors**
- Ensure `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Check that frontend is making requests to `http://localhost:8000`

### Logs

**Backend logs**: Check terminal where `uvicorn` is running
**Frontend logs**: Check browser developer console
**Database logs**: Check PostgreSQL logs

## 🎯 Next Steps

Once you have the local setup running:

1. **Explore the dashboard** - Navigate through different sections
2. **Test stock search** - Search for different stock symbols
3. **Check sentiment analysis** - View news and social media sentiment
4. **Try predictions** - Generate ML predictions for stocks
5. **Manage portfolio** - Add stocks to watchlist and portfolio

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [Material-UI Documentation](https://mui.com/)
- [PostgreSQL Documentation](https://postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Review the logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify environment variables are set properly

---

**Happy coding! 🚀📈**
