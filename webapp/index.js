const { html, $, EventManager } = require('@forgjs/noframework');
const FileType = require('file-type');
const mimeTypes = require('mime-types');

const CopyInput = require('./components/CopyInput');
const DropFile = require('./components/DropFile');
const FileElement = require('./components/FileElement');
const Qrcode = require('./components/QrCode');

const handleData = async (data, target) => {
  if (data.arrayBuffer instanceof ArrayBuffer) {
    let mime;
    try {
      mime = (await FileType.fromBuffer(data.arrayBuffer)).mime;
    } catch (e) {
      mime = mimeTypes.lookup(data.name);
    }
    target.appendChild(await FileElement({
      arrayBuffer: data.arrayBuffer,
      mimeType: mime,
      name: data.name,
    }));
  }
};

const App = () => {
  const eventManager = new EventManager();
  const peer = new Peer(undefined, {
    path: '/api',
    port: window.location.port,
    host: window.location.hostname,
    secure: true,
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], sdpSemantics: 'unified-plan' },
  });

  const qrCodeElem = Qrcode('');
  const copyInputElem = CopyInput('');

  const DomElement = html`<div class="app">
    <div class="not-connected hide">
      <h1>Scan QR code</h1>
      ${qrCodeElem}
      <h2>Or</h2>
      <h2>Copy to clipboard</h2>
      ${copyInputElem}
    </div>
    <div class="connected hide">
      ${DropFile(eventManager)}
      <div class="received-files"></div>
    </div>
  </div>`;
  const notConnectedElem = $('.not-connected', DomElement);
  const connectedElem = $('.connected', DomElement);
  const receivedFilesElem = $('.received-files', DomElement);

  const setConnected = (isConnected) => {
    if (isConnected === false) {
      notConnectedElem.classList.remove('hide');
      connectedElem.classList.add('hide');
    } else {
      notConnectedElem.classList.add('hide');
      connectedElem.classList.remove('hide');
    }
  };

  peer.on('open', (id) => {
    const url = `${window.location.protocol}//${window.location.host}/${id}`;
    qrCodeElem.setValue(url);
    copyInputElem.setValue(url);

    setConnected(false);
    if (window.location.pathname.length === 37) {
      const friendId = window.location.pathname.substring(1);
      const conn = peer.connect(friendId);
      conn.on('open', () => {
        setConnected(true);
        eventManager.subscribe('got-file', (file) => {
          conn.send({
            arrayBuffer: file,
            name: file.name,
          });
        });
        conn.on('data', (data) => handleData(data, receivedFilesElem));
      });
    }

    peer.on('connection', (conn) => {
      setConnected(true);
      eventManager.subscribe('got-file', (file) => {
        conn.send({
          arrayBuffer: file,
          name: file.name,
        });
      });
      conn.on('data', (data) => handleData(data, receivedFilesElem));
    });
  });

  return DomElement;
};

document.body.appendChild(App());
