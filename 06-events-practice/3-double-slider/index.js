export default class DoubleSlider {
  element;
  rangeSliderInnerElement;
  rangeSliderProgressElement;

  handlePointermove;

  constructor({
    min,
    max,
    formatValue = (value) => value,
    selected = {},
  }) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    if (!selected.from) {
      this.selected.from = min;
    }

    if (!selected.to) {
      this.selected.to = max;
    }

    this.element = this.createElement();
    this.rangeSliderInnerElement = this.element.querySelector('.range-slider__inner');
    this.rangeSliderProgressElement = this.element.querySelector('.range-slider__progress');

    this.getSliderThumbElement('left').addEventListener('pointerdown', this.handlePointerdown);
    this.getSliderThumbElement('right').addEventListener('pointerdown', this.handlePointerdown);
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.handlePointermove);
    document.removeEventListener('pointerup', this.handlePointerup);
  }

  remove() {
    this.element.remove();
  }

  getSliderThumbElement = (direction) => {
    return this.element.querySelector(`.range-slider__thumb-${direction}`);
  }

  getCurrentRelativeValue = (direction) => {
    const percentagePosition = this.rangeSliderProgressElement.style[direction];
    if (direction === 'left') {
      return parseFloat(percentagePosition);
    } else if (direction === 'right') {
      return 100 - parseFloat(percentagePosition);
    }
  }

  getValueElement = (direction) => {
    const dataElement = direction === 'left' ? 'from' : 'to';
    return this.element.querySelector(`span[data-element="${dataElement}"]`);
  }

  createElement() {
    const elem = document.createElement('div');
    elem.innerHTML = this.createTemplate();

    return elem.firstElementChild;
  }

  createTemplate() {
    const leftPercentage = (this.selected.from - this.min) / this.max * 100 + '%';
    const rightPercentage = (this.max - this.selected.to) / this.max * 100 + '%';

    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${leftPercentage}; right: ${rightPercentage}"></span>
          <span class="range-slider__thumb-left" style="left: ${leftPercentage}"></span>
          <span class="range-slider__thumb-right" style="right: ${rightPercentage}"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  handlePointerdown = (e) => {
    document.removeEventListener('pointermove', this.handlePointermove);

    const thumbDirection = e.target.classList.contains('range-slider__thumb-left') ? 'left' : 'right';
    const rangeType = thumbDirection === 'left' ? 'from' : 'to';

    const shiftX = this.rangeSliderInnerElement.getBoundingClientRect()[thumbDirection];
    const width = this.rangeSliderInnerElement.getBoundingClientRect().width;

    this.handlePointermove = (e) => {
      const relativeValuePercent = this.calculateRelativeProgress(thumbDirection, width, e.clientX - shiftX);
      const absoluteValue = this.calculateAbsoluteValue(thumbDirection, relativeValuePercent / 100);
      this.selected[rangeType] = absoluteValue;

      this.getSliderThumbElement(thumbDirection).style[thumbDirection] = relativeValuePercent + '%';
      this.rangeSliderProgressElement.style[thumbDirection] = relativeValuePercent + '%';
      this.getValueElement(thumbDirection).textContent = `${this.formatValue(absoluteValue)}`;
    };

    this.toggleGrabbingCursor();
    document.addEventListener('pointermove', this.handlePointermove);
    document.addEventListener('pointerup', this.handlePointerup);
  }

  handlePointerup = () => {
    document.removeEventListener('pointermove', this.handlePointermove);
    document.removeEventListener('pointerup', this.handlePointerup);
    this.toggleGrabbingCursor();

    this.element.dispatchEvent(new CustomEvent('range-select', {bubbles: true, detail: {
      from: this.selected.from,
      to: this.selected.to,
    }}));
  }

  calculateRelativeProgress = (direction, width, relativePosition) => {
    const isLeftThumb = direction === 'left';

    const position = isLeftThumb
      ? Math.max(relativePosition, 0)
      : Math.min(relativePosition, 0);

    const maxValue = isLeftThumb
      ? this.getCurrentRelativeValue('right')
      : 100 - this.getCurrentRelativeValue('left');

    return Math.min((position / width) * 100 * (isLeftThumb ? 1 : -1), maxValue);
  }

  calculateAbsoluteValue(direction, relativeValue) {
    const distanceFromEdge = Math.round((this.max - this.min) * relativeValue);

    if (direction === 'left') {
      return this.min + distanceFromEdge;
    } else if (direction === 'right') {
      return this.max - distanceFromEdge;
    }
  }

  toggleGrabbingCursor = () => {
    this.rangeSliderProgressElement.classList.toggle('range-slider_dragging');
    this.getSliderThumbElement('left').classList.toggle('range-slider_dragging');
    this.getSliderThumbElement('right').classList.toggle('range-slider_dragging');
  }
}
