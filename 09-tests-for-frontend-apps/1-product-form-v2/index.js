import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ProductForm from "../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductFormV2 extends ProductForm {
  sortableListElement;

  constructor (productId) {
    super(productId);
  }

  async render() {
    const elem = await super.render();
    this.addDeleteImageListener();
    return elem;
  }

  destroy() {
    super.destroy();
    this.element.removeEventListener('delete-list-item', this.handleImageDeleteEvent);
  }

  addDeleteImageListener() {
    this.element.addEventListener('delete-list-item', this.handleImageDeleteEvent);
  }

  handleImageDeleteEvent = () => {
    const urlToDelete = this.sortableListElement.querySelector('.products-edit__imagelist-item input[name="url"]').value;
    this.images = this.images.filter(image => image.url !== urlToDelete);
  }

  fillProductInfo(data) {
    const { title, description, subcategory, price, quantity, discount, status, images } = data;
    this.formElement.elements['title'].value = title;
    this.formElement.elements['description'].value = description;
    this.formElement.elements['subcategory'].value = subcategory;
    this.formElement.elements['price'].value = price;
    this.formElement.elements['quantity'].value = quantity;
    this.formElement.elements['discount'].value = discount;
    this.formElement.elements['status'].value = status;

    this.images = images;
    const imageElements = this.getImageElementList(images);
    this.sortableListElement = new SortableList({ items: imageElements }).element;

    this.formElement.querySelector('[data-element="imageListContainer"]')
      .firstElementChild.replaceWith(this.sortableListElement);
  }

  getImageElementList(images) {
    const elem = document.createElement('div');
    elem.innerHTML = this.createImageListTemplate(images);

    return [...elem.children];
  }
}
