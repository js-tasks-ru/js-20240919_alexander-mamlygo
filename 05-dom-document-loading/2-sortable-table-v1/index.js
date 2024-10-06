export default class SortableTable {
  element;
  subElements = {
    header: {},
    body: {},
  };
  sortData;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.element = this.createElement();
  }

  destroy() {
    this.element.remove();
  }

  update() {
    const headerElement = document.querySelector('.sortable-table__header');
    headerElement.replaceWith(this.subElements.header);

    const bodyElement = document.querySelector('.sortable-table__body');
    bodyElement.replaceWith(this.subElements.body);
  }

  sort(sortField, sortOrder) {
    const configItem = this.headerConfig.find((configItem) => configItem.id === sortField);

    if (configItem && configItem.sortable) {
      this.sortData = {
        sortField,
        sortOrder,
        sortType: configItem.sortType,
      };

      this.data.sort(this.getSortFunction(
        this.sortData.sortField,
        this.sortData.sortType,
        this.sortData.sortOrder,
      ));

      this.createHeaderElement();
      this.createBodyElement();

      this.update();
    }
  }

  createElement() {
    this.createHeaderElement();
    this.createBodyElement();

    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();

    const table = element.querySelector('.sortable-table');
    table.append(this.subElements.header);
    table.append(this.subElements.body);

    return element.firstElementChild;
  }

  createBodyElement() {
    const bodyElement = document.createElement('div');
    bodyElement.dataset.element = 'body';
    bodyElement.classList.add('sortable-table__body');
    bodyElement.innerHTML = this.createTableRowsTemplate();

    this.subElements.body = bodyElement;
  }

  createHeaderElement() {
    const headerElement = document.createElement('div');
    headerElement.dataset.element = 'header';
    headerElement.classList.add('sortable-table__header', 'sortable-table__row');
    headerElement.innerHTML = this.createHeaderElementsTemplate();

    this.subElements.header = headerElement;
  }

  createTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
        </div>
      </div>
      `;
  }

  createHeaderElementsTemplate() {
    return this.headerConfig.map((headerElement) => {
      const isSorted = this.sortData?.sortField === headerElement.id;

      const dataOrder = isSorted
        ? `data-order="${this.sortData.sortOrder}"`
        : '';

      const sortArrow = isSorted
        ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
           </span>`
        : '';

      return `
        <div class="sortable-table__cell" data-id="${headerElement.id}" data-sortable="${headerElement.sortable}" ${dataOrder}>
          <span>${headerElement.title}</span>
          ${sortArrow}
        </div>
      `;
    }).join('');
  }

  createTableRowsTemplate() {
    return this.data.map((item) => {
      const cellContents = this.headerConfig.map((headerElement) => {
        if (headerElement.id === 'images' && headerElement.template) {
          return headerElement.template(item.images);
        } else {
          return `<div class="sortable-table__cell">${item[headerElement.id]}</div>`;
        }
      }).join('');

      return `
        <a href="/products/${item.id}" class="sortable-table__row">
            ${cellContents}
        </a>
      `;
    }).join('');
  }

  getSortFunction(sortField, sortType, sortOrder) {
    const orderMultiplier = sortOrder === 'asc' ? 1 : -1;

    switch (sortType) {
    case 'string':
      return (a, b) => orderMultiplier * a[sortField].localeCompare(b[sortField], ['ru', 'en'], {caseFirst: 'upper'});
    case 'number':
      return (a, b) => orderMultiplier * (a[sortField] - b[sortField]);
    default:
      console.error(`Unsupported sortType: ${sortType}`);
      return () => 0;
    }
  }
}
