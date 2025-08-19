import express, { type Request, Response } from "express";
import { createServer, type Server } from "http";
import { spawn, ChildProcess } from "child_process";
import { createProxyMiddleware } from 'http-proxy-middleware';

let pythonProcess: ChildProcess | null = null;

export async function startPythonServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("🐍 Starting Python FastAPI server...");
    
    pythonProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
      cwd: 'server_python',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    pythonProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[Python] ${output}`);
      if (output.includes('Application startup complete')) {
        resolve();
      }
    });
    
    pythonProcess.stderr?.on('data', (data) => {
      console.error(`[Python Error] ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
    
    // Give it a few seconds to start
    setTimeout(resolve, 3000);
  });
}

export async function registerPythonRoutes(app: express.Express): Promise<Server> {
  // Start Python server
  await startPythonServer();
  
  // Proxy all /api requests to Python server
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Python backend unavailable' });
    }
  }));
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy', 
      backend: 'Node.js proxy → Python FastAPI',
      pythonRunning: pythonProcess !== null 
    });
  });
  
  const httpServer = createServer(app);
  
  // Cleanup on exit
  process.on('exit', () => {
    if (pythonProcess) {
      pythonProcess.kill();
    }
  });
  
  return httpServer;
}