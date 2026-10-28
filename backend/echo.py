from http.server import BaseHTTPRequestHandler, HTTPServer
import sys

class EchoHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len)
        with open("request_debug.txt", "w") as f:
            f.write("HEADERS:\n" + str(self.headers))
            f.write("BODY:\n" + post_body.decode('utf-8'))
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"predicted_co2_tonnes": 1.0}')

server = HTTPServer(('localhost', 8001), EchoHandler)
server.serve_forever()
