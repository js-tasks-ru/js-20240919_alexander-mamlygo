export default class RangePicker {
  element;

  from;
  to;

  pendingSelectedDate;
  visiblePeriodStart;

  get gridElements() {
    return this.element.querySelectorAll('.rangepicker__date-grid');
  }

  constructor(props) {
    const { from, to } = props;
    this.from = from;
    this.to = to;
    this.visiblePeriodStart = new Date(from.getFullYear(), from.getMonth(), 1);

    this.element = this.createElement();
    this.selectorElement = this.element.querySelector('.rangepicker__selector');
    this.inputElement = this.element.querySelector('.rangepicker__input');

    this.addEventListeners();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  createElement() {
    const elem = document.createElement('div');
    elem.innerHTML = this.createTemplate();

    return elem.firstElementChild;
  }

  addEventListeners() {
    this.inputElement.addEventListener('click', this.handleInputClick);

    document.addEventListener('click', this.handleDocumentClick);
  }

  addSelectorEventListeners() {
    const leftArrow = this.element.querySelector('.rangepicker__selector-control-left');
    const rightArrow = this.element.querySelector('.rangepicker__selector-control-right');

    leftArrow.addEventListener('click', this.handleArrowClick);
    rightArrow.addEventListener('click', this.handleArrowClick);

    this.selectorElement.addEventListener('click', this.handleSelectorClick);
  }

  handleInputClick = () => {
    if (this.selectorElement.children.length === 0) {
      this.selectorElement.innerHTML = this.createSelectorTemplate(this.visiblePeriodStart);
      this.addSelectorEventListeners();
    }

    this.element.classList.toggle('rangepicker_open');
  }

  handleDocumentClick = (e) => {
    if (!this.selectorElement.contains(e.target) && !this.element.contains(e.target)) {
      this.element.classList.remove('rangepicker_open');
    }
  }

  handleArrowClick = (e) => {
    const scrollDirection = e.target.classList.contains('rangepicker__selector-control-left') ? 'left' : 'right';
    const calendarElements = this.element.querySelectorAll('.rangepicker__calendar');

    const [leftCalendar, rightCalendar] = calendarElements;

    if (scrollDirection === 'left') {
      this.visiblePeriodStart.setMonth(this.visiblePeriodStart.getMonth() - 1, 1);
      const newLeftCal = this.createCalendarElement(
        this.visiblePeriodStart
      );
      rightCalendar.parentNode.insertBefore(newLeftCal, leftCalendar);
      rightCalendar.remove();
    } else {
      this.visiblePeriodStart.setMonth(this.visiblePeriodStart.getMonth() + 1, 1);
      const rightCalStartDate = new Date(this.visiblePeriodStart.getFullYear(), this.visiblePeriodStart.getMonth() + 1);
      const newRightCal = this.createCalendarElement(
        rightCalStartDate
      );
      rightCalendar.parentNode.insertBefore(newRightCal, rightCalendar.nextSibling);
      leftCalendar.remove();
    }
  }

  handleSelectorClick = (e) => {
    const cell = e.target.closest('.rangepicker__cell');

    if (!cell) { return; }
    if (!this.selectorElement.contains(cell)) { return; }
    cell.blur();

    if (!this.pendingSelectedDate) {
      this.pendingSelectedDate = new Date(cell.dataset.value);
      this.updateSelection();
    } else {
      const secondSelectedDate = new Date(cell.dataset.value);

      if (this.pendingSelectedDate < secondSelectedDate) {
        this.from = this.pendingSelectedDate;
        this.to = secondSelectedDate;
      } else {
        this.from = secondSelectedDate;
        this.to = this.pendingSelectedDate;
      }

      this.pendingSelectedDate = null;
      this.updateSelection();
    }
  }

  updateSelection = () => {
    this.inputElement.firstElementChild.textContent = `${this.formatDate(this.from)}`;
    this.inputElement.lastElementChild.textContent = `${this.formatDate(this.to)}`;

    this.element.dispatchEvent(new CustomEvent('date-range-selected', { bubbles: true, detail: {
      from: this.from,
      to: this.to,
    }}));

    this.gridElements.forEach(gridElement => {
      for (const el of gridElement.children) {
        this.updateCellClasses(el);
      }
    });
  }

  updateCellClasses = (cellElement) => {
    cellElement.classList.remove(
      'rangepicker__selected-from',
      'rangepicker__selected-to',
      'rangepicker__selected-between'
    );

    const cellDate = new Date(cellElement.dataset.value);

    if (this.pendingSelectedDate) {
      if (cellDate.getTime() === this.pendingSelectedDate.getTime()) {
        cellElement.classList.add('rangepicker__selected-from');
      }
    } else if (this.from && this.to) {
      if (cellDate.getTime() === this.from.getTime()) {
        cellElement.classList.add('rangepicker__selected-from');
      } else if (cellDate.getTime() === this.to.getTime()) {
        cellElement.classList.add('rangepicker__selected-to');
      } else if (cellDate > this.from && cellDate < this.to) {
        cellElement.classList.add('rangepicker__selected-between');
      }
    }
  }

  formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}.${month}.${year}`;
  }

  createRangepickerCellElement(date) {
    const elem = document.createElement('div');
    elem.innerHTML = `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}">${date.getDate()}</button>`;
    return elem.firstElementChild;
  }

  createCalendarButtonsTemplate(monthStartDate) {
    let buttons = [];

    const dayOfMonth = monthStartDate;
    const year = monthStartDate.getFullYear();
    const monthIndex = monthStartDate.getMonth();
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= lastDay; day++) {
      dayOfMonth.setDate(day);
      const element = this.createRangepickerCellElement(dayOfMonth);

      if (day === 1) {
        const weekdayIndex = dayOfMonth.getDay();
        const gridOffset = weekdayIndex === 0 ? 7 : weekdayIndex;
        element.style.setProperty('--start-from', `${gridOffset}`);
      }

      this.updateCellClasses(element);

      buttons.push(element);
    }

    return buttons.map((button) => button.outerHTML).join('');
  }

  createCalendarElement(monthStartDate) {
    const elem = document.createElement('div');
    elem.innerHTML = this.createCalendarTemplate(monthStartDate);

    return elem.firstElementChild;
  }

  createCalendarTemplate(monthStartDate) {
    const monthName = new Intl.DateTimeFormat("ru-RU", {month: 'long'}).format(monthStartDate);

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
            <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
            ${this.createCalendarButtonsTemplate(monthStartDate)}
        </div>
      </div>
    `;
  }

  createSelectorTemplate(visiblePeriodStart) {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.createCalendarTemplate(visiblePeriodStart)}
      ${this.createCalendarTemplate(new Date(visiblePeriodStart.getFullYear(), visiblePeriodStart.getMonth() + 1, 1))}
    `;
  }

  createTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
            <span data-element="from">${this.formatDate(this.from)}</span> -
            <span data-element="to">${this.formatDate(this.to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }
}
