const { html, $ } = require('@forgjs/noframework');

const Alert = ({
  message,
  yes,
  no,
  time = 5500,
}) => {
  const DomElement = html`<div class="alert">
    <p>${message}</p>
    ${yes || no ? html`<div class="buttons">
            ${yes ? html`<button class="button yes">${yes}</button>` : ''}
            ${no ? html`<button class="button no">${no}</button>` : ''}
        </div>` : ''}
  </div>`;

  const yesButton = $('.yes', DomElement);
  const noButton = $('.no', DomElement);

  document.body.appendChild(DomElement);

  return new Promise((resolve) => {
    if (yesButton) {
      yesButton.addEventListener('click', () => {
        DomElement.remove();
        resolve(true);
      });
    }

    if (noButton) {
      noButton.addEventListener('click', () => {
        DomElement.remove();
        resolve(false);
      });
    }
    if (!yesButton) {
      setTimeout(() => {
        DomElement.remove();
        resolve(false);
      }, time);
    }
  });
};

module.exports = Alert;
