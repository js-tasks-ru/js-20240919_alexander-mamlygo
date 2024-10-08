export default class NotificationMessage {
  static lastShownNotification;
  element;
  timerId;

  constructor(message, props = {}) {
    this.message = message;

    const {
      duration = 20,
      type
    } = props;
    this.duration = duration;
    this.type = type;

    this.element = this.createElement();
  }

  show(container = document.body) {
    if (NotificationMessage.lastShownNotification) {
      NotificationMessage.lastShownNotification.remove();
    }

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);

    container.append(this.element);
    NotificationMessage.lastShownNotification = this;
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element.remove();
    clearTimeout(this.timerId);
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();

    if (this.type === 'success') {
      element.firstElementChild.classList.add('success');
    } else if (this.type === 'error') {
      element.firstElementChild.classList.add('error');
    }

    return element.firstElementChild;
  }

  createTemplate() {
    return `
       <div class="notification" style="--value:${this.duration}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }
}
