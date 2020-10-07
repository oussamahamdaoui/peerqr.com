const lottie = require('lottie-web');
const { html } = require('@forgjs/noframework');

const AnimatedIcon = ({ name, ...params }) => {
  const DomElement = html`<div class="animated-icon"></div>`;
  DomElement.animation = lottie.loadAnimation({
    container: DomElement,
    renderer: 'svg',
    ...params,
    path: `icons-animate/${name}.json`,
  });

  return DomElement;
};

module.exports = AnimatedIcon;
