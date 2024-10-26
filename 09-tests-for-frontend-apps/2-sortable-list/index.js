export default class SortableList {
  element;
  placeholderElement;
  dragState;

  get grabHandleElements() {
    return this.element.querySelectorAll('[data-grab-handle]');
  }

  get deleteHandleElements() {
    return this.element.querySelectorAll('[data-delete-handle]');
  }

  constructor(props) {
    const { items } = props;
    this.dragState = {
      shiftX: 0,
      shiftY: 0,
      listItem: null,
      placeholderElement: null
    };
    this.element = this.createElement(items);

    this.createListeners();
  }

  destroy() {
    this.clearListeners();
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  createElement(items) {
    const elem = document.createElement("div");
    elem.innerHTML = this.createTemplate(items);

    return elem.firstElementChild;
  }

  createTemplate(items) {
    const listItems = items.map((item) => {
      item.classList.add('sortable-list__item');
      return item.outerHTML;
    }).join('');

    return `
      <ul class="sortable-list">
        ${listItems}
      </ul>
    `;
  }

  createListeners() {
    this.grabHandleElements.forEach(element => {
      element.addEventListener('pointerdown', this.handleGrabPointerdown);
    });

    this.deleteHandleElements.forEach(element => {
      element.addEventListener('pointerdown', this.handleDeletePointerdown);
    });
  }

  clearListeners() {
    this.grabHandleElements.forEach(element => {
      element.removeEventListener('pointerdown', this.handleGrabPointerdown);
    });

    this.deleteHandleElements.forEach(element => {
      element.removeEventListener('pointerdown', this.handleDeletePointerdown);
    });

    document.removeEventListener('mousemove', this.handleMouseMove);

    if (this.dragState.listItem) {
      this.dragState.listItem.removeEventListener('pointerup', this.handlePointerup);
    }
  }

  handleGrabPointerdown = (e) => {
    const listItem = e.target.closest('.sortable-list__item');
    if (!listItem) {
      return;
    }
    this.dragState.listItem = listItem;

    const itemWidth = listItem.offsetWidth;
    const itemHeight = listItem.offsetHeight;
    listItem.classList.add('sortable-list__item_dragging');

    listItem.style.width = `${itemWidth}px`;
    listItem.style.height = `${itemHeight}px`;

    this.dragState.shiftX = e.clientX - listItem.getBoundingClientRect().left;
    this.dragState.shiftY = e.clientY - listItem.getBoundingClientRect().top;

    this.moveAt(e.pageX, e.pageY);

    const previousListItem = listItem.previousElementSibling;
    const placeholderElem = this.createPlaceholderElement(itemWidth, itemHeight);
    this.dragState.placeholderElement = placeholderElem;

    if (previousListItem) {
      previousListItem.parentNode.insertBefore(placeholderElem, previousListItem.nextSibling);
    } else {
      listItem.parentNode.insertBefore(placeholderElem, listItem);
    }

    document.addEventListener('mousemove', this.handleMouseMove);
    listItem.addEventListener('pointerup', this.handlePointerup);
  }

  handlePointerup = () => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    this.dragState.listItem.removeEventListener('pointerup', this.handlePointerup);
    this.dragState.listItem.classList.remove('sortable-list__item_dragging');
    this.dragState.listItem.style.cssText = '';

    this.dragState.placeholderElement.replaceWith(this.dragState.listItem);
    this.dragState.placeholderElement = null;
    this.dragState.listItem = null;
  }

   moveAt = (pageX, pageY) => {
     this.dragState.listItem.style.left = pageX - this.dragState.shiftX + 'px';
     this.dragState.listItem.style.top = pageY - this.dragState.shiftY + 'px';
   }

  handleMouseMove = (event)=> {
    this.moveAt(event.pageX, event.pageY);

    // does not work by setting hidden = true as described here https://learn.javascript.ru/mouse-drag-and-drop
    this.dragState.listItem.style.display = 'none';
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.dragState.listItem.style.display = 'flex';

    if (!elemBelow) { return; }

    let listItemBelow = elemBelow.closest('.sortable-list__item');
    if (!listItemBelow) { return; }

    const draggedRect = this.dragState.listItem.getBoundingClientRect();
    const belowRect = listItemBelow.getBoundingClientRect();

    if (draggedRect.top < belowRect.top) {
      this.switchListItems(this.dragState.placeholderElement, listItemBelow);
    } else if (draggedRect.top > belowRect.top) {
      this.switchListItems(listItemBelow, this.dragState.placeholderElement);
    }
  }

  handleDeletePointerdown = (e) => {
    const listItem = e.target.closest('.sortable-list__item');
    if (!listItem) {
      return;
    }
    listItem.remove();
    listItem.removeEventListener('pointerdown', this.handleDeletePointerdown);
  }

  createPlaceholderElement(width, height) {
    const elem = document.createElement('div');
    elem.classList.add('sortable-list__placeholder');
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
    return elem;
  }

  switchListItems(element1, element2) {
    const parent = element1.parentNode;

    const nextSibling2 = element2.nextSibling;

    parent.insertBefore(element2, element1);

    if (nextSibling2) {
      parent.insertBefore(element1, nextSibling2);
    } else {
      parent.appendChild(element1);
    }
  }
}
