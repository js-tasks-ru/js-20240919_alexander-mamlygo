import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

export default class Page {
  selectedRange = {};

  get subElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  constructor() {
    this.selectedRange.to = new Date();

    const fromDate = new Date();
    fromDate.setMonth((this.selectedRange.to).getMonth() - 1);
    this.selectedRange.from = fromDate;
  }

  destroy() {
    for (const [_, component] of Object.entries(this.components)) {
      component.destroy();
    }

    this.remove();
    this.element.removeEventListener('date-select', this.handleDateSelect);
  }

  remove() {
    this.element.remove();
  }

  async render() {
    this.element = this.createElement();
    this.components = this.createComponents();
    this.renderComponents();
    this.createEventListeners();

    return this.element;
  }

  createComponents() {
    return {
      rangePicker: this.createRangePicker(),
      ordersChart: this.createOrdersChart(),
      salesChart: this.createSalesChart(),
      customersChart: this.createCustomersChart(),
      sortableTable: this.createSortableTable(),
    };
  }

  renderComponents() {
    for (const [name, component] of Object.entries(this.components)) {
      this.subElements[name].append(component.element);
    }
  }

  createEventListeners() {
    this.element.addEventListener('date-select', this.handleDateSelect);
  }

  handleDateSelect = async (event) => {
    const { from, to } = event.detail;

    this.selectedRange.from = from;
    this.selectedRange.to = to;

    await this.updateWithNewDateRange();
  }

  async updateWithNewDateRange() {
    const from = this.selectedRange.from;
    const to = this.selectedRange.to;

    await Promise.all([
      this.components.ordersChart.update(from, to),
      this.components.salesChart.update(from, to),
      this.components.customersChart.update(from, to),
      this.components.sortableTable.updatePeriod(from, to),
    ]);
  }

  createRangePicker() {
    return new RangePicker({
      from: this.selectedRange.from,
      to: this.selectedRange.to,
    });
  }

  createOrdersChart() {
    return new ColumnChart({
      label: 'Заказы',
      url: '/api/dashboard/orders',
      range: {
        from: this.selectedRange.from,
        to: this.selectedRange.to,
      }
    });
  }

  createSalesChart() {
    return new ColumnChart({
      label: 'Продажи',
      url: '/api/dashboard/sales',
      range: {
        from: this.selectedRange.from,
        to: this.selectedRange.to,
      },
      formatHeading: (salesTotal) => (`$${salesTotal.toLocaleString()}`),
    });
  }

  createCustomersChart() {
    return new ColumnChart({
      label: 'Клиенты',
      url: '/api/dashboard/customers',
      range: {
        from: this.selectedRange.from,
        to: this.selectedRange.to,
      },
    });
  }

  createSortableTable() {
    return new SortableTable(header, {
      url: '/api/dashboard/bestsellers',
      isSortLocally: true,
    });
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
          <div data-element="rangePicker"></div>
        </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }
}
