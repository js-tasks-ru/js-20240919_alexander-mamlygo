import ColumnChart from "../../04-oop-basic-intro-to-dom/1-column-chart/index.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChartV2 extends ColumnChart {
  constructor(props = {}) {
    super(props);
    const { url, range } = props;
    this.url = url;

    if (range) {
      this.range = range;
      this.update(range.from, range.to);
    }
  }

  async update(from, to) {
    const paramsObj = {from: from, to: to};
    const searchParams = new URLSearchParams(paramsObj);

    const response = await fetch(`${BACKEND_URL}/${this.url}/?${searchParams.toString()}`);
    const data = await response.json();
    this.data = Object.values(data);
    if (this.data.length > 0) {
      this.element.classList.remove('column-chart_loading');
      this.subElements.body.innerHTML = this.createChartTemplate();

      const total = this.data.reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
      }, 0);
      this.subElements.header.textContent = this.formatHeading(total);
    }

    return data;
  }
}
