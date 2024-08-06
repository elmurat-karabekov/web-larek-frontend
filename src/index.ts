import { AppState } from './components/model/AppState';
import { AppStateEmitter } from './components/model/AppStateEmitter';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Card } from './components/view/Card';
import { LarekApi } from './components/model/LarekApi';
import { Page } from './components/view/Page';
import './scss/styles.scss';
import { AppStateChanges, AppStateModals, UIActions } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const broker = new EventEmitter();

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi, CDN_URL);

// Чтобы мониторить все события, для отладки
broker.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderInfoTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const app = new AppStateEmitter(broker, larekApi, AppState);

// Глобальные контейнеры
const page = new Page(document.body, broker);

// Subscribe to UI events
broker.on(UIActions.openPreview, () => {
	app.model.openModal(AppStateModals.preview);
});

// Subscribe to model events
broker.on(AppStateChanges.products, () => {
	page.catalog = Array.from(app.model.products.values()).map((product) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), broker);
		return card.render({
			title: product.title,
			image: product.image,
			category: product.category,
			price: app.model.formatCurrency(product.price),
			_id: product.id,
		});
	});

	page.counter = app.model.basketTotal;
});

app.model.loadProducts();
