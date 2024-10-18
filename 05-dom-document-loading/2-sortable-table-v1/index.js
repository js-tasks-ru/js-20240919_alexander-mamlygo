export default class SortableTable {
  element;
  sortData;

  get subElements() {
    const elements = {};
    this.element.querySelectorAll('[data-element]').forEach(element => {
      elements[element.dataset.element] = element;
    });
    return elements;
  }

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.element = this.createElement();
  }

  destroy() {
    this.element.remove();
  }

  update() {
    const headerElement = this.element.querySelector('.sortable-table__header');
    headerElement.innerHTML = this.createHeaderTemplate();

    const bodyElement = this.element.querySelector('.sortable-table__body');
    bodyElement.innerHTML = this.createBodyTemplate();
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

      this.update();
    }
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();

    return element.firstElementChild;
  }

  createTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.createHeaderTemplate()}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.createBodyTemplate()}
            </div>
            ${this.createEmptyTableTemplate()}
            ${this.createLoadingLineTemplate()}
        </div>
      </div>
      `;
  }

  createLoadingLineTemplate() {
    return `
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  createBodyTemplate() {
    return this.data.map((item) => this.createTableRowTemplate(item)).join('');
  }

  createEmptyTableTemplate() {
    return `
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfy your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
    `;
  }

  createHeaderTemplate() {
    return this.headerConfig.map((headerElement) => {
      const isSorted = this.sortData?.sortField === headerElement.id;

      const dataOrder = isSorted
        ? `data-order="${this.sortData.sortOrder}"`
        : '';

      return `
        <div class="sortable-table__cell" data-id="${headerElement.id}" data-sortable="${headerElement.sortable}" ${dataOrder}>
          <span>${headerElement.title}</span>
          ${ isSorted ? this.createArrowTemplate() : '' }
        </div>
      `;
    }).join('');
  }

  createArrowTemplate() {
    return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
           <span class="sort-arrow"></span>
        </span>
    `;
  }

  createTableRowTemplate(item) {
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
