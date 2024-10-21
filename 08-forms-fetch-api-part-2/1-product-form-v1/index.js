import fetchJson from './utils/fetch-json.js';
import escapeHtml from "./utils/escape-html.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  formElement;

  get subElements() {
    const elements = {};
    this.element.querySelectorAll('[data-element]').forEach(element => {
      elements[element.dataset.element] = element;
    });
    return elements;
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const elem = this.createElement();
    this.element = elem;
    this.formElement = this.element.querySelector('[data-element="productForm"]');

    await this.fillProductCategories();
    const res = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
    if (res.length > 0) {
      this.fillProductInfo(res[0]);
    }

    this.addEventListeners();
    return elem;
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
    const uploadImgButton = this.formElement.querySelector('[name="uploadImage"]');
    uploadImgButton.addEventListener('click', this.handleFileUpload);

    this.formElement.addEventListener('submit', this.handleFormSubmit);
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
    this.formElement.querySelector('[data-element="imageListContainer"]')
      .firstElementChild.innerHTML = this.createImageListTemplate(images);
  }

  async fillProductCategories() {
    const categories = await fetchJson(`${BACKEND_URL}/api/rest/categories?_refs=subcategory`);
    const subcategoryElement = this.formElement.querySelector('[name="subcategory"]');

    subcategoryElement.innerHTML = categories.map((category) => {
      return category.subcategories.map(subcategory => {
        return `<option value="${escapeHtml(subcategory.id)}">${escapeHtml(category.title)} &gt; ${escapeHtml(subcategory.title)}</option>`;
      }).join('');
    }).join('');
  }

  handleFileUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      if (file) {
        try {
          const res = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            body: formData,
            contentType: 'application/json',
            headers: {
              'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
            },
          });

          this.images.push({url: res.data.link, source: file.name});
          this.formElement.querySelector('[data-element="imageListContainer"]')
            .firstElementChild.innerHTML = this.createImageListTemplate(this.images);
        } catch (error) {
          console.error('Error during file upload:', error);
        }
      }

      fileInput.remove();
    });
  }

  handleFormSubmit = async (e) => {
    e.preventDefault();

    await this.save();
  }

  async save() {
    await fetch(`${BACKEND_URL}/api/rest/products`, {
      method: 'PUT',
      body: JSON.stringify({
        title: this.formElement.elements['title'].value,
        description: this.formElement.elements['description'].value,
        subcategory: this.formElement.elements['subcategory'].value,
        price: parseInt(this.formElement.elements['price'].value),
        quantity: parseInt(this.formElement.elements['quantity'].value),
        discount: parseInt(this.formElement.elements['discount'].value),
        status: parseInt(this.formElement.elements['status'].value),
        images: this.images,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (this.productId) {
      this.element.dispatchEvent(new CustomEvent('product-updated', {bubbles: true}));
    } else {
      this.element.dispatchEvent(new CustomEvent('product-saved', {bubbles: true}));
    }
  }

  createTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
            <fieldset>
             <label class="form-label">Название товара</label>
             <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
        </div>
        <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
                <ul class="sortable-list">
                </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
            </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
        </div>
        <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
            </select>
        </div>
        <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
                Сохранить товар
            </button>
        </div>
        </form>
      </div>
    `;
  }

  createImageListTemplate(images) {
    return images.map((image) => this.createImageTemplate(image)).join('');
  }

  createImageTemplate(imageData) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${escapeHtml(imageData.url)}">
        <input type="hidden" name="source" value="${escapeHtml(imageData.source)}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(imageData.url)}">
          <span>${escapeHtml(imageData.source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }
}
