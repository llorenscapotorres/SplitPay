#!/usr/bin/env python3
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Simple test FastAPI server
app = FastAPI(title="SplitBill Python API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Python FastAPI server is running!"}

@app.get("/api/test")
async def test():
    return {"status": "success", "backend": "Python FastAPI"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Python FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)