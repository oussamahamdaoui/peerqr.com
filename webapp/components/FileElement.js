const { html, $ } = require('@forgjs/noframework');
const timeAgo = require('timeago.js');
const AnimatedIcon = require('./AnimatedIcon');
const Icon = require('./Icon');

const FileElement = async ({ arrayBuffer, mimeType, name }) => {
  const downloadIcon = AnimatedIcon({ name: 'download', autoplay: false, loop: 0 });
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const objectURL = URL.createObjectURL(blob);
  const at = new Date();

  const DomElement = html`<div class="file">
      <div class="time">
        ${Icon('clock')}
        <span>${timeAgo.format(at)}</span>
      </div>
      <img class="hide">
      <div>
        <span class="name">${name}</span>
        <a href="${objectURL}" download="${name}">${downloadIcon}</a>
      </div>
  </div>`;

  const time = $('.time>span', DomElement);

  if (mimeType.split('/')[0] === 'image') {
    $('img', DomElement).src = objectURL;
    $('img', DomElement).classList.remove('hide');
  }

  const update = () => {
    if (timeAgo.format(at) !== time.innerText) {
      time.innerText = timeAgo.format(at);
    }
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);

  $('a', DomElement.addEventListener('click', () => {
    downloadIcon.animation.stop();
    downloadIcon.animation.play();
  }));

  return DomElement;
};

module.exports = FileElement;
