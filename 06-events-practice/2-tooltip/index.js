class Tooltip {
  static instance;

  element;

  currentTooltipElement;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;

    this.element = this.createElement();
  }

  createElement() {
    const element = document.createElement('div');
    element.classList.add('tooltip');
    element.style.pointerEvents = 'none';

    return element;
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.handleTooltipPointerover);
    document.removeEventListener('pointerout', this.handleTooltipPointerout);
  }

  render(tipText) {
    document.body.append(this.element);
    this.element.textContent = tipText;
  }

  remove() {
    this.element.remove();
  }

  initialize () {
    document.addEventListener('pointerover', this.handleTooltipPointerover);
    document.addEventListener('pointerout', this.handleTooltipPointerout);
  }

  handleTooltipPointerover = (e) => {
    if (this.currentTooltipElement) {
      return;
    }

    const target = e.target.closest('[data-tooltip]');

    if (!target) {
      return;
    }

    this.currentTooltipElement = target;
    this.render(target.dataset.tooltip);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleTooltipPointerout = (e) => {
    if (!this.currentTooltipElement) {
      return;
    }

    const relatedTarget = e.relatedTarget;

    if (
      relatedTarget
      && this.currentTooltipElement.contains(relatedTarget)
      && !relatedTarget.dataset.tooltip
    ) {
      return;
    }

    this.currentTooltipElement = null;
    this.remove();
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    this.element.style.left = e.clientX + 'px';
    this.element.style.top = e.clientY + 'px';
  }
}

export default Tooltip;
