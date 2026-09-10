const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;

const server = http.createServer((req, res) => {
  // 关键修复：剥离查询参数（?v=1.8.1），否则带版本号的资源全部 404
  const urlPath = req.url.split('?')[0];
  const filePath = urlPath === '/' ? path.join(root, 'index.html') : path.join(root, urlPath);
  const ext = path.extname(filePath);
  const types = { '.css': 'text/css', '.js': 'application/javascript', '.html': 'text/html' };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(8899, () => console.log('Server running on http://127.0.0.1:8899'));
