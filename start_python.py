#!/usr/bin/env python3
import os
import sys

# Add server_python to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server_python'))

# Import and run the server
import uvicorn
from server_python.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Python FastAPI server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)