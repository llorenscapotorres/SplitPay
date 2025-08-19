#!/bin/bash
echo "Stopping Node.js server..."
pkill -f "tsx server/index.ts" || true

echo "Starting Python FastAPI server on port 5000..."
cd server_python && python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload