export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor(props = {}) {
    const {
      data = [],
      label = '',
      value = 0,
      link = '',
      formatHeading = (value) => value,
    } = props;

    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.element = this.createElement();
  }

  update(newData) {
    this.data = newData;
    this.element.innerHTML = this.createTemplate();
  }

  destroy() {
    this.element.remove();
  }

  remove() {
    this.destroy();
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();

    if (this.data.length === 0) {
      element.firstElementChild.classList.add('column-chart_loading');
    }

    return element.firstElementChild;
  }

  createTemplate() {
    return `
     <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.createLinkTemplate()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.createChartTemplate()}
        </div>
      </div>
    </div>
    `;
  }

  createLinkTemplate() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`;
    }
    return '';
  }

  createChartTemplate() {
    return this.getColumnProps(this.data).map((item) => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
    }).join('');
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
