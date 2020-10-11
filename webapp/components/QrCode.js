const qrcode = require('qrcode-generator');
const { html } = require('@forgjs/noframework');

const Qrcode = () => {
  const DomElement = html`<div class="qrcode">
    </div>`;
  let SvgElement = null;

  DomElement.setValue = (v) => {
    const qr = qrcode(0, 'H');
    qr.addData(v);
    qr.make();
    const newSvgElement = html`${qr.createSvgTag()}`;
    if (SvgElement == null) {
      DomElement.appendChild(newSvgElement);
      SvgElement = newSvgElement;
    } else {
      DomElement.replaceChild(newSvgElement, SvgElement);
      SvgElement = newSvgElement;
    }
  };

  return DomElement;
};

module.exports = Qrcode;
