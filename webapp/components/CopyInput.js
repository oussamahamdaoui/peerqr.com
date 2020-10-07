const { html, escape, $ } = require('@forgjs/noframework');
const AnimatedIcon = require('./AnimatedIcon');

const CopyInput = (text) => {
  const icon = AnimatedIcon({
    name: 'copy',
    autoplay: false,
    loop: 1,
  });
  const DomElement = html`<div class="copy-input">
    <input readonly class="value" value="${escape(text)}">
    <button>${icon}</button>
  </div>`;

  DomElement.addEventListener('click', () => {
    icon.animation.stop();
    icon.animation.play();
    const copyText = $('.value', DomElement);
    let start = 0;
    if (copyText.value[0] === '>') {
      start = 1;
    }
    copyText.select(start);
    copyText.setSelectionRange(start, 99999);
    document.execCommand('copy');
  });

  DomElement.setValue = (v) => {
    $('.value', DomElement).value = v;
  };

  return DomElement;
};

module.exports = CopyInput;
