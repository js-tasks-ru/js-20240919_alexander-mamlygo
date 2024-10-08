import { SortableTableV1 } from "./sortableTableV1.js";

export default class SortableTableV2 extends SortableTableV1 {
  isSortLocally;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true,
  } = {}) {
    super(headersConfig, data);

    this.isSortLocally = isSortLocally;
    this.sort(sorted.id, sorted.order);

    this.createListeners();
  }

  handleTablePointerdown = (e) => {
    let cell = e.target.closest('.sortable-table__cell');

    if (!cell) {
      return;
    }

    if (!this.subElements.header?.contains(cell)) {
      return;
    }

    const { id: sortField, order: sortOrder } = cell.dataset;

    if (!sortOrder || sortOrder === 'asc') {
      this.sort(sortField, 'desc');
    } else {
      this.sort(sortField, 'asc');
    }
  }

  createListeners() {
    this.element.addEventListener('pointerdown', this.handleTablePointerdown);
  }

  destroyListeners() {
    this.element.removeEventListener('pointerdown', this.handleTablePointerdown);
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }

  sort(sortField, sortOrder) {
    if (this.isSortLocally) {
      super.sort(sortField, sortOrder);
    } else {
      this.sortOnServer(sortField, sortOrder);
    }
  }

  sortOnServer(sortField, sortOrder) {}
}
