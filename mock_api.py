#!/usr/bin/env python3
"""
Mock API server for testing frontend
"""
import json
import uuid
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys

# Store tasks in memory
tasks_db = {}
user_id = str(uuid.uuid4())

class TaskAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        path = urlparse(self.path).path
        
        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # List tasks
        if f'/api/{user_id}/tasks' in path:
            task_list = list(tasks_db.values())
            self.wfile.write(json.dumps(task_list).encode())
            return
        
        # Get single task
        if '/tasks/' in path and path.endswith(path.split('/')[-1]):
            task_id = path.split('/')[-1]
            if task_id in tasks_db:
                self.wfile.write(json.dumps(tasks_db[task_id]).encode())
            else:
                self.wfile.write(json.dumps({"error": "Task not found"}).encode())
            return
        
        self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        path = urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        
        self.send_response(201)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if f'/api/{user_id}/tasks' in path:
            try:
                data = json.loads(body)
                task_id = str(uuid.uuid4())
                now = datetime.utcnow().isoformat()
                
                task = {
                    "id": task_id,
                    "user_id": user_id,
                    "description": data.get("description", ""),
                    "due_date": data.get("due_date"),
                    "completed": False,
                    "created_at": now,
                    "updated_at": now
                }
                
                tasks_db[task_id] = task
                self.wfile.write(json.dumps(task).encode())
                print(f"[API] Created task: {task}", file=sys.stderr)
            except Exception as e:
                self.send_response(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_PUT(self):
        """Handle PUT requests"""
        path = urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if '/tasks/' in path:
            task_id = path.split('/')[-1]
            if task_id in tasks_db:
                try:
                    data = json.loads(body)
                    task = tasks_db[task_id]
                    task["description"] = data.get("description", task["description"])
                    if "due_date" in data:
                        task["due_date"] = data["due_date"]
                    task["updated_at"] = datetime.utcnow().isoformat()
                    
                    self.wfile.write(json.dumps(task).encode())
                    print(f"[API] Updated task: {task}", file=sys.stderr)
                except Exception as e:
                    self.send_response(400)
                    self.wfile.write(json.dumps({"error": str(e)}).encode())
            else:
                self.send_response(404)
                self.wfile.write(json.dumps({"error": "Task not found"}).encode())
    
    def do_PATCH(self):
        """Handle PATCH requests"""
        path = urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if '/complete' in path:
            task_id = path.split('/')[4]
            if task_id in tasks_db:
                try:
                    data = json.loads(body)
                    task = tasks_db[task_id]
                    task["completed"] = data.get("completed", task["completed"])
                    task["updated_at"] = datetime.utcnow().isoformat()
                    
                    self.wfile.write(json.dumps(task).encode())
                except Exception as e:
                    self.send_response(400)
                    self.wfile.write(json.dumps({"error": str(e)}).encode())
            else:
                self.send_response(404)
                self.wfile.write(json.dumps({"error": "Task not found"}).encode())
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        path = urlparse(self.path).path
        
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if '/tasks/' in path:
            task_id = path.split('/')[-1]
            if task_id in tasks_db:
                del tasks_db[task_id]
                print(f"[API] Deleted task: {task_id}", file=sys.stderr)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

if __name__ == '__main__':
    port = 8000
    try:
        server = HTTPServer(('0.0.0.0', port), TaskAPIHandler)
        print(f"[API] Mock API server running on http://0.0.0.0:{port}", file=sys.stderr)
        print(f"[API] User ID: {user_id}", file=sys.stderr)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\n[API] Server stopped", file=sys.stderr)
    except OSError:
        # Try next port
        for port in range(8001, 9000):
            try:
                server = HTTPServer(('0.0.0.0', port), TaskAPIHandler)
                print(f"[API] Mock API server running on http://0.0.0.0:{port}", file=sys.stderr)
                print(f"[API] User ID: {user_id}", file=sys.stderr)
                try:
                    server.serve_forever()
                except KeyboardInterrupt:
                    print("\n[API] Server stopped", file=sys.stderr)
                break
            except OSError:
                continue
