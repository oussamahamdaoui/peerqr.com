const express = require('express');
const helmet = require('helmet');
const path = require('path');

const STATIC_DIR = path.join(__dirname, 'static');

const app = express();
const server = require('http').createServer(app);

const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  path: '/api',
  allow_discovery: false,
  proxied: true,
  debug: false,
});

app.use(express.static(STATIC_DIR));
app.use(peerServer);
app.get('/:id', (req, res) => {
  res.sendFile(path.resolve(STATIC_DIR, 'index.html'));
});
app.use(helmet());

server.listen(3000);
