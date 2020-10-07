const { html } = require('@forgjs/noframework');
const feather = require('feather-icons');

const Icon = async (name) => {
  let DomElement;
  if (feather.icons[name]) {
    DomElement = html`${feather.icons[name].toSvg()}`;
  } else {
    DomElement = null;
  }

  return DomElement;
};

module.exports = Icon;
