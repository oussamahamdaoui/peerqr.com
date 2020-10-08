const { html, $ } = require('@forgjs/noframework');
const AnimatedIcon = require('./AnimatedIcon');

const dropHandler = (ev, eventManager) => {
  if (ev.files) {
    for (let i = 0; i < ev.files.length; i += 1) {
      const file = ev.files.item(i);
      eventManager.emit('got-file', file);
    }
    return;
  }
  if (ev.clipboardData.items) {
    for (let i = 0; i < ev.clipboardData.items.length; i += 1) {
      const file = ev.clipboardData.items[i].getAsFile();
      if (file) {
        eventManager.emit('got-file', file);
      }
    }
    return;
  }
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
    <input type="file" multiple="true" />
  </div>`;

  const inputElem = $('input', DomElement);

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
    event.preventDefault();
    dropHandler(event, eventManager);
  });

  DomElement.addEventListener('paste', (evt) => {
    dropHandler(evt, eventManager);
  });
  DomElement.addEventListener('dragover', dragOverHandler);

  DomElement.addEventListener('click', () => {
    inputElem.click();
  });

  inputElem.addEventListener('change', (e) => {
    e.preventDefault();
    dropHandler(inputElem, eventManager);
  });

  return DomElement;
};

module.exports = DropFile;
