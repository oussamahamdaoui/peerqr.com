const { html, $, escape } = require('@forgjs/noframework');
const FileType = require('file-type');
const timeAgo = require('timeago.js');
const FileElement = require('./FileElement');
const Icon = require('./Icon');

const EMOJI_REGEX = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;
function emojiUnicode(emoji) {
  let comp;
  if (emoji.length === 1) {
    comp = emoji.charCodeAt(0);
  }
  comp = (
    (emoji.charCodeAt(0) - 0xD800) * 0x400
    + (emoji.charCodeAt(1) - 0xDC00) + 0x10000
  );
  if (comp < 0) {
    comp = emoji.charCodeAt(0);
  }
  return `&#x${comp.toString('16')};`;
}

const unicodeEmoji = (str) => str.replace(/&#x([0-9a-f]{5});/g, (c) => String.fromCodePoint(parseInt(c.replace(/[&#x;]/g, ''), 16)));

const Message = ({ message = '', from = 'me' } = {}) => {
  const at = new Date();
  const m = escape(unicodeEmoji(message));
  const big = m.trim().length === 2 && m.match(EMOJI_REGEX);

  const DomElement = html`<div class="message ${from} ${big ? 'big' : ''}">
    <div class="time">${Icon('clock')}<span>${timeAgo.format(at)}</span></div>
    <div class="data">${m}</div>
  </div>`;
  const time = $('.time>span', DomElement);

  const update = () => {
    if (timeAgo.format(at) !== time.innerText) {
      time.innerText = timeAgo.format(at);
    }
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);

  return DomElement;
};

const Messager = (eventManager) => {
  const DomElement = html`
  <div class="messager">
        <div class="messages">
        </div>
        <div class="toolbar" >
          <textarea></textarea>
          <button>${Icon('send')}</button>
        </div>
  </div>
  `;

  const messages = $('.messages', DomElement);
  let isTypingTimeOut = null;

  $('textarea', DomElement).addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && $('textarea', DomElement).value.trim() !== '') {
      e.preventDefault();
      const message = $('textarea', DomElement).value.replace(EMOJI_REGEX, emojiUnicode);
      messages.appendChild(Message({ message, from: 'me' }));
      eventManager.emit('send-message', {
        message,
      });
      $('textarea', DomElement).value = '';
      return;
    }
    if (isTypingTimeOut) {
      clearTimeout(isTypingTimeOut);
    }
    isTypingTimeOut = setTimeout(() => {
      eventManager.emit('im-typing');
    }, 1000);
  });

  $('button', DomElement).addEventListener('click', () => {
    if ($('textarea', DomElement).value.trim() === '') return;
    eventManager.emit('send-message', {
      message: $('textarea', DomElement).value.replace(EMOJI_REGEX, emojiUnicode),
    });
    $('textarea', DomElement).value = '';
  });

  eventManager.subscribe('to-mesages', (isOpen) => {
    if (isOpen) {
      DomElement.classList.add('open');
    } else {
      DomElement.classList.remove('open');
    }
  });

  eventManager.subscribe('file-received', async (props) => {
    messages.appendChild(await FileElement(props));
  });

  eventManager.subscribe('message-received', ({ message }) => {
    messages.appendChild(Message({ message, from: 'it' }));
  });

  eventManager.subscribe('render-file', async (file) => {
    const { mime } = (await FileType.fromBuffer(await file.arrayBuffer));
    messages.appendChild(await FileElement({
      name: file.name,
      arrayBuffer: await file.arrayBuffer,
      mimeType: mime,
    }));
  });

  return DomElement;
};

module.exports = Messager;
