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
  <div class="drop-file" tabindex="0">
    ${icon}
    <h2>You can drop files here</h2>
    <button>Got it</button>
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
    if (DomElement.classList.contains('close')) {
      inputElem.click();
    } else {
      DomElement.classList.add('close');
      eventManager.emit('to-mesages', true);
    }
  });

  DomElement.addEventListener('keypress', (e) => {
    if (!e.key === 'enter' || document.activeElement !== DomElement) return;
    if (DomElement.classList.contains('close')) {
      inputElem.click();
    } else {
      eventManager.emit('to-mesages', true);
      DomElement.classList.add('close');
    }
  });

  inputElem.addEventListener('change', (e) => {
    e.preventDefault();
    dropHandler(inputElem, eventManager);
  });

  $('button', DomElement).addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    DomElement.classList.add('close');
    eventManager.emit('to-mesages', true);
  });

  return DomElement;
};

module.exports = DropFile;
