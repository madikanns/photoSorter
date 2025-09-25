#!/bin/bash

# PhotoSorter Deployment Script
echo "🚀 Starting PhotoSorter deployment..."

# Check if we're in the right directory
if [ ! -f "photoSorter-simple.html" ]; then
    echo "❌ Error: photoSorter-simple.html not found. Please run from the correct directory."
    exit 1
fi

# Create deployment directory structure
echo "📁 Creating deployment structure..."
mkdir -p deploy
cp photoSorter-simple.html deploy/
cp gps-extractor.py deploy/
cp requirements.txt deploy/

# Create a simple Python web server for deployment
cat > deploy/app.py << 'EOF'
#!/usr/bin/env python3
"""
PhotoSorter Web Application
Simple deployment version for cloud hosting
"""

import os
import sys
import json
import base64
import tempfile
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class PhotoSorterHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/photoSorter-simple.html':
            self.serve_file('photoSorter-simple.html')
        elif self.path == '/gps-extractor.py':
            self.serve_file('gps-extractor.py')
        else:
            self.send_error(404, "Not found")
    
    def do_POST(self):
        if self.path == '/extract-gps':
            self.handle_gps_extraction()
        else:
            self.send_error(404, "Not found")
    
    def serve_file(self, filename):
        try:
            with open(filename, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            if filename.endswith('.html'):
                self.send_header('Content-type', 'text/html')
            elif filename.endswith('.py'):
                self.send_header('Content-type', 'text/plain')
            else:
                self.send_header('Content-type', 'application/octet-stream')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, "File not found")
    
    def handle_gps_extraction(self):
        """Handle GPS extraction requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            file_data_base64 = data.get('file_data')
            file_name = data.get('file_name', 'unknown.jpg')
            
            if not file_data_base64:
                self.send_error(400, "No file data provided")
                return
            
            # For cloud deployment, we'll use a simplified GPS extraction
            # that doesn't require exiftool
            result = self.extract_gps_simple(file_data_base64, file_name)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error processing request: {str(e)}")
    
    def extract_gps_simple(self, file_data_base64, file_name):
        """Simplified GPS extraction for cloud deployment"""
        try:
            # For cloud deployment, we'll return a mock response
            # In a real deployment, you'd implement proper GPS extraction
            return {
                'success': True,
                'latitude': None,
                'longitude': None,
                'has_location': False,
                'message': 'GPS extraction not available in cloud deployment. Please use the desktop version for full GPS functionality.'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'GPS extraction error: {str(e)}'
            }

def run_server(port=8000):
    """Run the PhotoSorter web server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, PhotoSorterHandler)
    print(f"🌐 PhotoSorter server running on port {port}")
    print(f"📱 Access your app at: http://localhost:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    run_server(port)
EOF

# Make the deployment script executable
chmod +x deploy/app.py

echo "✅ Deployment files created successfully!"
echo "📦 Deployment package ready in 'deploy/' directory"
echo ""
echo "🚀 To deploy:"
echo "1. Upload the 'deploy/' directory to your hosting service"
echo "2. Run: python3 app.py"
echo "3. Access your PhotoSorter app!"
