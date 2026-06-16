export class ToastView {
  constructor() {
    this.root = document.querySelector('[data-game-toast]');
    this.timeout = null;
  }

  show(message) {
    if (!this.root) {
      return;
    }
    this.root.textContent = message;
    this.root.removeAttribute('hidden');
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.root.setAttribute('hidden', '');
    }, 1500);
  }
}
