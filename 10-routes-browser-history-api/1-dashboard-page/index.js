import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  get subElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.remove();
    this.element.removeEventListener('date-select', this.handleDateSelect);
  }

  remove() {
    this.element.remove();
  }

  async render() {
    this.element = this.createElement();

    this.rangePicker = this.createRangePicker();

    const [ordersChart, salesChart, customersChart, table] = await Promise.all([
      this.createOrdersChart(),
      this.createSalesChart(),
      this.createCustomersChart(),
      this.createSortableTable(),
    ]);

    this.ordersChart = ordersChart;
    this.salesChart = salesChart;
    this.customersChart = customersChart;
    this.table = table;

    this.element.querySelector('.dashboard__charts').append(this.customersChart.element);
    this.element.querySelector('.dashboard__charts').append(this.ordersChart.element);
    this.element.querySelector('.dashboard__charts').append(this.salesChart.element);
    this.element.querySelector('.content__top-panel').append(this.rangePicker.element);
    this.element.append(this.table.element);

    this.createEventListeners();

    return this.element;
  }

  createEventListeners() {
    this.element.addEventListener('date-select', this.handleDateSelect);
  }

  handleDateSelect = async (event) => {
    const { from, to } = event.detail;

    await Promise.all([
      this.ordersChart.update(from, to),
      this.salesChart.update(from, to),
      this.customersChart.update(from, to),
      this.table.updatePeriod(from, to),
    ]);
  }

  createRangePicker() {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setMonth((toDate).getMonth() - 1);
    const rangePicker = new RangePicker({ from: fromDate, to: toDate });
    rangePicker.element.dataset.element = 'rangePicker';

    return rangePicker;
  }

  async createOrdersChart() {
    const orderChart = new ColumnChart({
      label: 'Заказы',
      url: '/api/dashboard/orders',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      }
    });
    await orderChart.render();
    orderChart.element.dataset.element = 'orderChart';
    orderChart.element.classList.add('dashboard__chart_orders');

    return orderChart;
  }

  async createSalesChart() {
    const salesChart = new ColumnChart({
      label: 'Продажи',
      url: '/api/dashboard/sales',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      },
      formatHeading: (salesTotal) => (`$${salesTotal.toLocaleString()}`),
    });
    await salesChart.render();

    salesChart.element.dataset.element = 'salesChart';
    salesChart.element.classList.add('dashboard__chart_sales');

    return salesChart;
  }

  async createCustomersChart() {
    const customersChart = new ColumnChart({
      label: 'Клиенты',
      url: '/api/dashboard/customers',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      }
    });
    await customersChart.render();

    customersChart.element.dataset.element = 'customersChart';
    customersChart.element.classList.add('dashboard__chart_customers');

    return customersChart;
  }

  async createSortableTable() {
    const table = new SortableTable(header, {
      url: '/api/dashboard/bestsellers',
      isSortLocally: true,
    });
    await table.render();

    return table;
  }

  createElement() {
    const elem = document.createElement('div');
    elem.innerHTML = this.createTemplate(new RangePicker());

    return elem;
  }

  createTemplate() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
        </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
      </div>

      <h3 class="block-title">Best sellers</h3>
    </div>
    `;
  }
}
