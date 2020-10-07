const qrcode = require('qrcode-generator');
const { html, emptyElement } = require('@forgjs/noframework');
const AnimatedQrCode = require('./AnimatedQrCode');

const Qrcode = (url) => {
  const DomElement = html`<div class="qrcode">
    </div>`;

  DomElement.setValue = (v) => {
    emptyElement(DomElement);
    const qr = qrcode(0, 'H');
    qr.addData(v);
    qr.make();
    DomElement.appendChild(AnimatedQrCode());
    DomElement.appendChild(html`${qr.createSvgTag()}`);
  };
  DomElement.setValue(url);

  return DomElement;
};

module.exports = Qrcode;
