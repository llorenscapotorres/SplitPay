#!/usr/bin/env python3
"""
Standalone Python FastAPI backend server for SplitBill
This runs independently on port 8000 while the Node.js frontend runs on port 5000
"""

import sys
import os
import uvicorn
from pathlib import Path

# Add server_python to Python path
current_dir = Path(__file__).parent
server_python_dir = current_dir / "server_python"
sys.path.insert(0, str(server_python_dir))

# Import the FastAPI app
from routes import app

if __name__ == "__main__":
    print("🐍 Starting standalone Python FastAPI backend on port 8000...")
    print("📱 Frontend will continue running on port 5000 via Node.js")
    print("🔄 APIs will be available at: http://localhost:8000/api/")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )