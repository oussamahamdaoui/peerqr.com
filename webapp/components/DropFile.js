const { html } = require('@forgjs/noframework');
const AnimatedIcon = require('./AnimatedIcon');

const dropHandler = (ev, eventManager) => {
  ev.preventDefault();
  if (ev.dataTransfer.items) {
    for (let i = 0; i < ev.dataTransfer.items.length; i += 1) {
      if (ev.dataTransfer.items[i].kind === 'file') {
        const file = ev.dataTransfer.items[i].getAsFile();
        eventManager.emit('got-file', file);
      }
    }
  } else {
    for (let i = 0; i < ev.dataTransfer.files.length; i += 1) {
      eventManager.emit('got-file', ev.dataTransfer.files[i]);
    }
  }
};

const dragOverHandler = (ev) => {
  ev.preventDefault();
};

const DropFile = (eventManager) => {
  const icon = AnimatedIcon({
    name: 'archive',
    autoplay: false,
    loop: false,
  });
  const DomElement = html`
  <div class="drop-file">
    ${icon}
    <h2>Drag & drop files here</h2>
  </div>`;

  DomElement.addEventListener('mouseenter', () => {
    icon.animation.stop();
    icon.animation.setDirection(1);
    icon.animation.play();
  });

  DomElement.addEventListener('mouseleave', () => {
    icon.animation.setDirection(-1);
    icon.animation.stop();
    icon.animation.play();
  });

  DomElement.addEventListener('drop', (event) => {
    dropHandler(event, eventManager);
  });
  DomElement.addEventListener('dragover', dragOverHandler);

  return DomElement;
};

module.exports = DropFile;
