const { html, $ } = require('@forgjs/noframework');
const AnimatedIcon = require('./AnimatedIcon');

const FileElement = async ({ arrayBuffer, mimeType, name }) => {
  const downloadIcon = AnimatedIcon({ name: 'download', autoplay: false, loop: 0 });
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const objectURL = URL.createObjectURL(blob);

  const DomElement = html`<div class="file">
      <span class="name">${name}</span>
      <a href="${objectURL}" download="${name}">${downloadIcon}</a>
  </div>`;

  $('a', DomElement.addEventListener('click', () => {
    downloadIcon.animation.stop();
    downloadIcon.animation.play();
  }));

  return DomElement;
};

module.exports = FileElement;
