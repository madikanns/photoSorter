#!/usr/bin/env python3
"""
GPS Extractor Server - Extracts GPS data from photos using EXIFTool
"""

import json
import os
import tempfile
import subprocess
import urllib.request
import urllib.parse
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

class GPSExtractorHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle GPS extraction requests"""
        if self.path == '/extract-gps':
            try:
                # Read the request data
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                file_data = data.get('file_data')
                file_name = data.get('filename', 'unknown.jpg')
                
                if not file_data:
                    self.send_error(400, "No file data provided.")
                    return
                
                # Decode base64 data
                import base64
                file_bytes = base64.b64decode(file_data)
                
                # Create a temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as temp_file:
                    temp_file.write(file_bytes)
                    temp_file_path = temp_file.name
                
                try:
                    # Use EXIFTool to extract GPS data
                    print(f"Processing file: {file_name}")
                    result = self.extract_gps_with_exiftool(temp_file_path)
                    print(f"GPS extraction result: {result}")
                    
                    # If GPS data found, get location name
                    print(f"GPS result check: success={result.get('success')}, has_location={result.get('has_location')}")
                    if result.get('success') and result.get('has_location'):
                        print(f"🔍 CALLING REVERSE GEOCODING for {result['latitude']}, {result['longitude']}")
                        location_name = self.get_location_name(result['latitude'], result['longitude'])
                        result['location_name'] = location_name
                        print(f"🌍 FINAL LOCATION NAME: {location_name}")
                    else:
                        print("❌ No GPS data found, skipping reverse geocoding")
                    
                    # Send the result back
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode('utf-8'))
                    
                finally:
                    # Clean up temporary file
                    try:
                        os.unlink(temp_file_path)
                    except:
                        pass
                
            except Exception as e:
                self.send_error(500, f"Error processing file: {str(e)}")
        else:
            self.send_error(404, "Not found")
    
    def extract_gps_with_exiftool(self, file_path):
        """Extract GPS data using EXIFTool"""
        try:
            # Run EXIFTool to get GPS coordinates
            cmd = [
                'exiftool',
                '-GPS:GPSLatitude',
                '-GPS:GPSLongitude', 
                '-GPS:GPSLatitudeRef',
                '-GPS:GPSLongitudeRef',
                '-c', '%.6f',
                '-j',  # JSON output
                file_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Parse the JSON output
                exif_data = json.loads(result.stdout)
                if exif_data and len(exif_data) > 0:
                    gps_data = exif_data[0]
                    
                    lat = gps_data.get('GPSLatitude')
                    lng = gps_data.get('GPSLongitude')
                    lat_ref = gps_data.get('GPSLatitudeRef', 'N')
                    lng_ref = gps_data.get('GPSLongitudeRef', 'E')
                    
                    # Debug: Print the raw GPS data
                    print(f"🔍 RAW GPS DATA: lat={lat}, lng={lng}, lat_ref={lat_ref}, lng_ref={lng_ref}")
                    
                    if lat and lng:
                        # Convert to decimal degrees
                        latitude = float(lat)
                        longitude = float(lng)
                        
                        # Apply direction references
                        if lat_ref == 'S':
                            latitude = -latitude
                        if lng_ref == 'W':
                            longitude = -longitude
                        
                        # Special handling for California coordinates
                        # If longitude is positive but should be negative for California
                        if latitude > 30 and latitude < 50 and longitude > 0 and longitude < 180:
                            # This looks like California coordinates that should be negative
                            print(f"⚠️  SUSPECTED CALIFORNIA COORDINATES: Converting {longitude} to {-longitude}")
                            longitude = -longitude
                        
                        # Debug: Print the raw GPS data
                        print(f"Raw GPS data: lat={lat}, lng={lng}, lat_ref={lat_ref}, lng_ref={lng_ref}")
                        print(f"Converted coordinates: {latitude}, {longitude}")
                        
                        return {
                            'success': True,
                            'latitude': latitude,
                            'longitude': longitude,
                            'has_location': True
                        }
                    else:
                        return {
                            'success': True,
                            'latitude': None,
                            'longitude': None,
                            'has_location': False,
                            'message': 'No GPS data found in file'
                        }
                else:
                    return {
                        'success': False,
                        'error': 'No EXIF data found'
                    }
            else:
                return {
                    'success': False,
                    'error': f'EXIFTool error: {result.stderr}'
                }
                
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'EXIFTool timeout'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'EXIFTool exception: {str(e)}'
            }
    
    def get_location_name(self, latitude, longitude):
        """Get location name from coordinates using multiple reverse geocoding APIs"""
        try:
            import urllib.request
            import urllib.parse
            import time
            
            # Try multiple APIs for better reliability
            apis = [
                # API 1: OpenStreetMap Nominatim (with different parameters)
                {
                    'url': f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=5&addressdetails=1&accept-language=en",
                    'headers': {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                },
                # API 2: BigDataCloud (free, no rate limits)
                {
                    'url': f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={latitude}&longitude={longitude}&localityLanguage=en",
                    'headers': {
                        'User-Agent': 'photoSorter/1.0',
                        'Accept': 'application/json'
                    }
                },
                # API 3: OpenStreetMap with different zoom level
                {
                    'url': f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=3&addressdetails=1",
                    'headers': {
                        'User-Agent': 'photoSorter/1.0 (https://github.com/photoSorter)',
                        'Accept': 'application/json'
                    }
                }
            ]
            
            for i, api in enumerate(apis):
                try:
                    print(f"Trying API {i+1} for location: {latitude}, {longitude}")
                    
                    # Create request
                    req = urllib.request.Request(api['url'])
                    for header, value in api['headers'].items():
                        req.add_header(header, value)
                    
                    # Make the request
                    with urllib.request.urlopen(req, timeout=15) as response:
                        data = json.loads(response.read().decode('utf-8'))
                        print(f"API {i+1} response: {data}")
                        
                        if i == 0 or i == 2:  # OpenStreetMap APIs
                            if data and data.get('display_name') and not data.get('error'):
                                # Extract location name
                                if data.get('address'):
                                    addr = data['address']
                                    if addr.get('city') or addr.get('town') or addr.get('village'):
                                        location_name = addr.get('city') or addr.get('town') or addr.get('village')
                                        if addr.get('state'):
                                            location_name += f", {addr['state']}"
                                        elif addr.get('country'):
                                            location_name += f", {addr['country']}"
                                    elif addr.get('state'):
                                        location_name = addr['state']
                                        if addr.get('country'):
                                            location_name += f", {addr['country']}"
                                    elif addr.get('country'):
                                        location_name = addr['country']
                                    else:
                                        location_name = data['display_name'].split(',')[0]
                                else:
                                    location_name = data['display_name'].split(',')[0]
                                
                                print(f"Location found: {location_name}")
                                return location_name
                        
                        elif i == 1:  # BigDataCloud API
                            if data and not data.get('error'):
                                city = data.get('city', '')
                                state = data.get('principalSubdivision', '')
                                country = data.get('countryName', '')
                                locality = data.get('locality', '')
                                
                                # Build location name from available data
                                if city:
                                    location_name = city
                                    if state:
                                        location_name += f", {state}"
                                    elif country:
                                        location_name += f", {country}"
                                elif state:
                                    location_name = state
                                    if country:
                                        location_name += f", {country}"
                                elif country:
                                    location_name = country
                                elif locality:
                                    # Special handling for ocean locations
                                    if "sea" in locality.lower() or "ocean" in locality.lower():
                                        location_name = f"Near {locality}"
                                    else:
                                        location_name = f"Near {locality}"
                                else:
                                    # If all else fails, use coordinates
                                    location_name = f"{latitude:.4f}, {longitude:.4f}"
                                
                                print(f"Location found: {location_name}")
                                return location_name
                    
                    # Add delay between API calls to avoid rate limiting
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"API {i+1} failed: {e}")
                    continue
            
            # If all APIs fail, return coordinates
            print("All reverse geocoding APIs failed")
            return f"{latitude:.4f}, {longitude:.4f}"
                    
        except Exception as e:
            print(f"Error getting location name: {e}")
            return f"{latitude:.4f}, {longitude:.4f}"

def run_server(port):
    """Run the GPS extractor server"""
    try:
        server = HTTPServer(('localhost', port), GPSExtractorHandler)
        print(f"GPS Extractor Server running on http://localhost:{port}")
        print("Press Ctrl+C to stop")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    run_server(port)