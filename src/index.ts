import { AppState } from './components/model/AppState';
import { AppStateEmitter } from './components/model/AppStateEmitter';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Card } from './components/view/Card';
import { LarekApi } from './components/model/LarekApi';
import { Page } from './components/view/Page';
import './scss/styles.scss';
import { AppStateChanges, AppStateModals, IProduct, UIActions } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/view/common/Modal';
import { Basket } from './components/view/Basket';

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
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderInfoTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Все отображения внутри модалки
const preview = new Card(cloneTemplate(cardPreviewTemplate), broker);
const basket = new Basket(cloneTemplate(basketTemplate), broker);

// Модель данных приложения
const app = new AppStateEmitter(broker, larekApi, AppState);

// Глобальные контейнеры
const page = new Page(document.body, broker);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), broker);

// Subscribe to UI events
broker.on(UIActions.openPreview, (data: { id: string }) => {
	app.model.openModal.call(app.model, AppStateModals.preview, data.id);
});

broker.on(UIActions.cardButtonAction, (data: { id: string }) => {
	if (app.model.basket.has(data.id)) {
		app.model.removeProductFromBasket.call(app.model, data.id);
	} else {
		app.model.addProductToBasket.call(app.model, data.id);
	}
	preview.isInBasket = app.model.basket.has(data.id);
});

broker.on(
	UIActions.openBasket,
	app.model.openModal.bind(app.model, AppStateModals.basket)
);

broker.on(UIActions.removeProduct, (data: { id: string }) => {
	app.model.removeProductFromBasket.call(app.model, data.id);
});

broker.on(
	UIActions.closeModal,
	app.model.openModal.bind(app.model, AppStateModals.none)
);

// Subscribe to model events
broker.on(AppStateChanges.products, (products: IProduct[]) => {
	page.catalog = products.map((product) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), broker);
		return card.render({
			...product,
		});
	});
});

broker.on(AppStateChanges.basket, () => {
	page.counter = app.model.basket.size;

	basket.render({
		items: Array.from(app.model.basket.values()).map((item, idx) => {
			const basketItem = new Card(cloneTemplate(cardBasketTemplate), broker);
			return basketItem.render({
				...item,
				basketItemIndex: idx + 1,
			});
		}),
		isDisabled: app.model.basket.size < 1,
		total: app.model.basketTotal,
	});
});

broker.on(AppStateModals.preview, () => {
	modal.render({
		content: preview.render({
			...app.model.products.get(app.model.previewProductId),
			isInBasket: app.model.basket.has(app.model.previewProductId),
		}),
	});
});

broker.on(AppStateModals.basket, () => {
	modal.render({
		content: basket.render({
			items: Array.from(app.model.basket.values()).map((item, idx) => {
				const basketItem = new Card(cloneTemplate(cardBasketTemplate), broker);
				return basketItem.render({
					...item,
					basketItemIndex: idx + 1,
				});
			}),
			isDisabled: app.model.basket.size < 1,
			total: app.model.basketTotal,
		}),
	});
});

app.model.loadProducts();
