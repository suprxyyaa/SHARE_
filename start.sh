#!/bin/bash

echo "Starting SHARE..."

# Start backend
bash -c "cd /d/medshare/backend && source venv/Scripts/activate && uvicorn app.main:app --reload --port 8000" &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend from its own directory
bash -c "cd /d/medshare/frontend && npm run dev" &
FRONTEND_PID=$!

echo ""
echo "✅ SHARE is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://127.0.0.1:8000"
echo "   API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop everything"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
