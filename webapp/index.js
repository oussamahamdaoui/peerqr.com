const { html, $, EventManager } = require('@forgjs/noframework');

// fixes safari issues

(function init() {
  // eslint-disable-next-line no-use-before-define
  File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
  // eslint-disable-next-line no-use-before-define
  Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;

  function myArrayBuffer() {
    // this: File or Blob
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(this);
    });
  }
}());

const FileType = require('file-type');
const mimeTypes = require('mime-types');

const CopyInput = require('./components/CopyInput');
const DropFile = require('./components/DropFile');
const Qrcode = require('./components/QrCode');
const Messager = require('./components/Messager');

const handleData = async (data, eventManager) => {
  if (data.arrayBuffer instanceof ArrayBuffer) {
    let mime;
    try {
      mime = (await FileType.fromBuffer(data.arrayBuffer)).mime;
    } catch (e) {
      mime = mimeTypes.lookup(data.name);
    }
    eventManager.emit('file-received', {
      arrayBuffer: data.arrayBuffer,
      mimeType: mime,
      name: data.name,
    });
  } else if (typeof data !== 'string') {
    eventManager.emit('message-received', data);
  }
};

const App = () => {
  const eventManager = new EventManager();
  const peer = new Peer(undefined, {
    path: '/api',
    port: window.location.port,
    host: window.location.hostname,
    secure: process.env.NODE_ENV === 'production',
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], sdpSemantics: 'unified-plan' },
  });

  const qrCodeElem = Qrcode('');
  const copyInputElem = CopyInput('');
  const messager = Messager(eventManager);

  const DomElement = html`<div class="app">
    <div class="not-connected hide">
      <div class="info">
        <h1>Peerqr.com</h1>
        <h2>Get your unique link by scanning the QR code or by clicking the copy button</h2>
        <p>Once you share this link with another device, you will have a secure P2P connection between those devices</p>
      </div>
      <div class="card">
        ${qrCodeElem}
        ${copyInputElem}
      </div>
    </div>
    <div class="connected hide">
      ${messager}
      <div class="files-sender">
        ${DropFile(eventManager)}
      </div>
    </div>
  </div>`;
  const notConnectedElem = $('.not-connected', DomElement);
  const connectedElem = $('.connected', DomElement);

  const setConnected = (isConnected) => {
    if (isConnected === false) {
      notConnectedElem.classList.remove('hide');
      connectedElem.classList.add('hide');
    } else {
      notConnectedElem.classList.add('hide');
      connectedElem.classList.remove('hide');
    }
  };

  peer.on('open', async (id) => {
    const url = `${window.location.protocol}//${window.location.host}/${id}`;

    setConnected(false);
    copyInputElem.setValue(url);
    qrCodeElem.setValue(url);
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
          console.log('render-file');
          eventManager.emit('render-file', {
            arrayBuffer: file.arrayBuffer(),
            name: file.name,
          });
        });

        eventManager.subscribe('send-message', (message) => {
          conn.send(message);
        });

        eventManager.subscribe('im-typing', () => {
          conn.send({
            type: 'is-typing',
          });
        });

        conn.on('data', (data) => handleData(data, eventManager, conn));
        conn.on('close', () => {
          setConnected(false);
        });
      });
    }

    peer.on('connection', (conn) => {
      setConnected(true);
      eventManager.subscribe('got-file', (file) => {
        conn.send({
          arrayBuffer: file,
          name: file.name,
        });
        eventManager.emit('render-file', {
          arrayBuffer: file.arrayBuffer(),
          name: file.name,
        });
      });
      eventManager.subscribe('send-message', (message) => {
        conn.send(message);
      });

      eventManager.subscribe('im-typing', () => {
        conn.send({
          type: 'is-typing',
        });
      });

      conn.on('data', (data) => handleData(data, eventManager, conn));

      conn.on('close', () => {
        setConnected(false);
      });
    });
  });

  return DomElement;
};

document.body.appendChild(App());
