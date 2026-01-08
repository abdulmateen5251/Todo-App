#!/bin/bash

echo "🚀 Starting Todo Application..."
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Using SQLite for development instead."
    export DATABASE_URL="sqlite:///./todo.db"
fi

# Start Backend
echo "📦 Starting Backend (FastAPI)..."
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Run migrations (if using PostgreSQL)
if [[ "$DATABASE_URL" != sqlite* ]]; then
    echo "Running database migrations..."
    alembic upgrade head
fi

# Start backend in background
echo "Starting FastAPI server at http://localhost:8000"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Start Frontend
echo ""
echo "⚛️  Starting Frontend (Next.js)..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "Starting Next.js server at http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Application started!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📝 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or press Ctrl+C twice"
echo ""

# Save PIDs for cleanup
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo '✅ Stopped'; exit 0" INT

echo "Press Ctrl+C to stop all servers"
wait
