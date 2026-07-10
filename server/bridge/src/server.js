const crypto = require('crypto');
const dgram = require('dgram');
const http = require('http');
const WebSocket = require('ws');

const PORT = Number(process.env.PORT || 27016);
const UDP_HOST = process.env.UDP_HOST || '127.0.0.1';
const UDP_PORT = Number(process.env.UDP_PORT || 27015);
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

function log(level, message, meta = {}) {
  const levels = ['debug', 'info', 'warn', 'error'];
  if (levels.indexOf(level) < levels.indexOf(LOG_LEVEL)) return;
  console.log(JSON.stringify({ level, message, ...meta, time: new Date().toISOString() }));
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data));
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  return Buffer.from(data);
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, udpHost: UDP_HOST, udpPort: UDP_PORT }));
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
});

const wss = new WebSocket.Server({ server, path: '/websocket' });

wss.on('connection', (ws, req) => {
  const id = crypto.randomUUID();
  const remote = req.socket.remoteAddress;
  const udp = dgram.createSocket('udp4');
  let closed = false;

  function cleanup(reason) {
    if (closed) return;
    closed = true;
    log('info', 'client disconnected', { id, reason });
    try { udp.close(); } catch {}
    try { ws.close(); } catch {}
  }

  udp.on('message', (message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message, { binary: true }, (error) => {
        if (error) {
          log('warn', 'failed to send udp packet to websocket', { id, error: error.message });
        }
      });
    }
  });

  udp.on('error', (error) => {
    log('error', 'udp socket error', { id, error: error.message });
    cleanup('udp-error');
  });

  ws.on('message', (raw) => {
    const packet = toBuffer(raw);
    udp.send(packet, UDP_PORT, UDP_HOST, (error) => {
      if (error) {
        log('warn', 'failed to forward packet to hlds', { id, error: error.message });
      }
    });
  });

  ws.on('close', () => cleanup('websocket-close'));
  ws.on('error', (error) => {
    log('warn', 'websocket error', { id, error: error.message });
    cleanup('websocket-error');
  });

  log('info', 'client connected', { id, remote, udpHost: UDP_HOST, udpPort: UDP_PORT });
});

server.listen(PORT, () => {
  log('info', 'bridge listening', { port: PORT, websocketPath: '/websocket', udpHost: UDP_HOST, udpPort: UDP_PORT });
});

process.on('SIGTERM', () => {
  log('info', 'received SIGTERM');
  server.close(() => process.exit(0));
});
