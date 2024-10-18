import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTableV3 extends SortableTableV2 {
  start = 0
  end = 30;
  pageLimit = 30;

  emptyPlaceholderElement;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = false,
    url
  } = {}) {
    super(headersConfig, {data: data, sorted: {}, isSortLocally});
    this.url = url;
    this.sortData = {
      sortField: sorted.id,
      sortOrder: sorted.order,
    };

    this.emptyPlaceholderElement = this.element.querySelector('.sortable-table__empty-placeholder');
    this.loadingLineElement = this.element.querySelector('.sortable-table__loading-line');

    this.addScrollEventListener();
    this.render();
  }

  async render() {
    await this.loadData();

    if (this.data.length !== 0) {
      this.emptyPlaceholderElement.style.display = 'none';
      this.loadingLineElement.style.display = 'none';

      this.update();
    } else {
      this.emptyPlaceholderElement.style.display = 'block';
    }
  }

  async loadData(sortExisting = false) {
    const paramsObj = {
      _start: sortExisting ? 0 : this.start,
      _end: this.end
    };
    const searchParams = new URLSearchParams(paramsObj);

    if (this.sortData.sortField && this.sortData.sortOrder) {
      searchParams.append('_sort', this.sortData.sortField);
      searchParams.append('_order', this.sortData.sortOrder);
    }

    this.loadingLineElement.style.display = 'block';
    const response = await fetch(`${BACKEND_URL}/${this.url}?${searchParams.toString()}`);
    const newData = await response.json();

    if (sortExisting) {
      this.data = newData;
    } else if (newData.length) {
      this.data = [...this.data, ...newData];
    } else {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  sort(sortField, sortOrder) {
    if (this.data.length === 0) {
      return;
    }

    if (this.isSortLocally) {
      this.sortOnClient(sortField, sortOrder);
    } else {
      this.sortOnServer(sortField, sortOrder);
    }
  }

  sortOnClient (id, order) {
    super.sort(id, order);
  }

  sortOnServer (id, order) {
    if (this.checkSortability(id)) {
      this.sortData = {
        sortField: id,
        sortOrder: order,
      };

      this.loadData(true).then(() => this.update());
    }
  }

  addScrollEventListener() {
    window.addEventListener('scroll', this.debounce(this.handleScroll, 300));
  }

  handleScroll = async () => {
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
      const currentScrollY = window.scrollY;

      this.start = this.end;
      this.end = this.start + this.pageLimit;
      await this.render();

      window.scrollTo(0, currentScrollY);
    }
  }

  checkSortability = (id) => {
    const configItem = this.headerConfig.find((configItem) => configItem.id === id);
    return configItem && configItem.sortable;
  }

  debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
}
