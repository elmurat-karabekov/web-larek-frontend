import { AppState } from './components/model/AppState';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Card } from './components/view/Card';
import { LarekApi } from './components/model/LarekApi';
import { Page } from './components/view/Page';
import './scss/styles.scss';
import {
	AppStateChanges,
	IOrderInfo,
	UIActions,
	IContacts,
	IBasketItem,
} from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/view/common/Modal';
import { Basket } from './components/view/Basket';
import { OrderInfoForm } from './components/view/OrderInfoForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

const events = new EventEmitter();
const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi, CDN_URL);

// Модель данных приложения
const app = new AppState(events);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderInfoTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Все отображения внутри модалки
const preview = new Card(cloneTemplate(cardPreviewTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderInfoForm = new OrderInfoForm(
	cloneTemplate(orderInfoTemplate),
	events
);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Subscribe to UI events
events.on(UIActions.openModal, () => {
	page.locked = true;
});

events.on(UIActions.closeModal, () => {
	page.locked = false;
});

events.on(UIActions.openPreview, (data: { id: string }) => {
	modal.render({
		content: preview.render({
			...app.products.get(data.id),
			isInBasket: app.basketItems.has(data.id),
		}),
	});
});

events.on(UIActions.cardButtonAction, (data: { id: string }) => {
	if (app.basketItems.has(data.id)) {
		app.removeProductFromBasket.call(app, data.id);
	} else {
		app.addProductToBasket.call(app, data.id);
	}
	preview.isInBasket = app.basketItems.has(data.id);
});

events.on(UIActions.openBasket, () => {
	modal.render({
		content: basket.render({}),
	});
});

events.on(UIActions.removeProduct, (data: { id: string }) => {
	app.removeProductFromBasket(data.id);
});

events.on(UIActions.openOrderInfo, () => {
	app.clearFormValidation();

	modal.render({
		content: orderInfoForm.render({
			...app.orderInfo,
			valid: app.formStatus.valid,
			errors: app.formStatus.message,
		}),
	});
});

events.on(UIActions.fillOrderInfo, (formData: Partial<IOrderInfo>) => {
	app.fillOrderInfo(formData);

	orderInfoForm.render({
		...app.orderInfo,
		valid: app.formStatus.valid,
		errors: app.formStatus.message,
	});
});

events.on(UIActions.submitOrderInfo, () => {
	app.clearFormValidation();

	modal.render({
		content: contactsForm.render({
			...app.contacts,
			valid: app.formStatus.valid,
			errors: app.formStatus.message,
		}),
	});
});

events.on(UIActions.fillContacts, (formData: Partial<IContacts>) => {
	app.fillContacts(formData);

	contactsForm.render({
		...app.contacts,
		valid: app.formStatus.valid,
		errors: app.formStatus.message,
	});
});

events.on(UIActions.submitContacts, async () => {
	try {
		const orderResult = await larekApi.orderProducts(app.order);
		if (orderResult.id) {
			app.resetForms();
			modal.render({
				content: success.render({
					total: orderResult.total,
				}),
			});
		}
	} catch (error) {
		console.error('Error processing the order:', error);
	}
});

events.on(UIActions.closeOrderSuccees, () => {
	modal.close();
	app.clearBasket();
});

// Subscribe to model events
events.on(AppStateChanges.appInitLoad, () => {
	page.catalog = Array.from(app.products.values()).map((product) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), events);
		return card.render({
			...product,
		});
	});

	basket.render({
		items: [], // or Array.from(app.basketItems.values()) - if data persisted somewhere
		isDisabled: true,
		total: 0,
	});
});

events.on(AppStateChanges.basketItems, (basketItems: IBasketItem[]) => {
	page.counter = basketItems.length;

	basket.render({
		items: basketItems.map((item, idx) => {
			const basketItem = new Card(cloneTemplate(cardBasketTemplate), events);
			return basketItem.render({
				...item,
				basketItemIndex: idx + 1,
			});
		}),
		isDisabled: basketItems.length < 1,
		total: app.basketTotal,
	});
});

larekApi.getProducts().then((products) => {
	app.setProducts(products);
	events.emit(AppStateChanges.appInitLoad);
});
