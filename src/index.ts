import { AppState } from './components/model/AppState';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Card } from './components/view/Card';
import { LarekApi } from './components/model/LarekApi';
import { Page } from './components/view/Page';
import './scss/styles.scss';
import {
	AppStateChanges,
	AppModals,
	IOrderInfo,
	IProduct,
	UIActions,
	IContacts,
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
const app = new AppState(larekApi, events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
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
events.on(UIActions.openPreview, (data: { id: string }) => {
	app.openModal(AppModals.preview, data.id);
});

events.on(UIActions.cardButtonAction, (data: { id: string }) => {
	if (app.basketItems.has(data.id)) {
		app.removeProductFromBasket.call(app, data.id);
	} else {
		app.addProductToBasket.call(app, data.id);
	}
	preview.isInBasket = app.basketItems.has(data.id);
});

events.on(UIActions.openBasket, app.openModal.bind(app, AppModals.basket));

events.on(UIActions.removeProduct, (data: { id: string }) => {
	app.removeProductFromBasket(data.id);
});

events.on(
	UIActions.openOrderInfo,
	app.openModal.bind(app, AppModals.orderInfo)
);

events.on(UIActions.fillOrderInfo, (formData: Partial<IOrderInfo>) => {
	app.fillOrderInfo(formData);
});

events.on(UIActions.submitOrderInfo, () => {
	app.clearFormValidation();
	app.openModal(AppModals.contacts);
});

events.on(UIActions.fillContacts, (formData: Partial<IContacts>) => {
	app.fillContacts(formData);
});

events.on(UIActions.submitContacts, async () => {
	app.clearFormValidation();
	const orderResult = await app.orderProducts();
	if (orderResult.id) {
		app.openModal(AppModals.success);
	}
});

events.on(UIActions.closeOrderSuccees, () => {
	app.openModal(AppModals.none);
});

events.on(UIActions.closeModal, () => {
	app.clearFormValidation();
	app.openModal(AppModals.none);
});

// Subscribe to model events
events.on(AppStateChanges.products, (products: IProduct[]) => {
	page.catalog = products.map((product) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), events);
		return card.render({
			...product,
		});
	});
});

events.on(AppStateChanges.basketItems, () => {
	page.counter = app.basketItems.size;

	basket.render({
		items: Array.from(app.basketItems.values()).map((item, idx) => {
			const basketItem = new Card(cloneTemplate(cardBasketTemplate), events);
			return basketItem.render({
				...item,
				basketItemIndex: idx + 1,
			});
		}),
		isDisabled: app.basketItems.size < 1,
		total: app.basketTotal,
	});
});

events.on(AppStateChanges.orderInfo, () => {
	orderInfoForm.render({
		...app.orderInfo,
		valid: !app.modalMessage,
		errors: app.modalMessage,
	});
});

events.on(AppStateChanges.contacts, () => {
	contactsForm.render({
		...app.contacts,
		valid: !app.modalMessage,
		errors: app.modalMessage,
	});
});

events.on(AppStateChanges.orderSuccess, (data: { total: number }) => {
	success.total = data.total;
});

events.on(
	AppStateChanges.modal,
	(appModal: { previous: AppModals; current: AppModals }) => {
		page.locked = modal.open = appModal.current !== AppModals.none;
	}
);

events.on(AppModals.preview, () => {
	modal.render({
		content: preview.render({
			...app.products.get(app.previewProductId),
			isInBasket: app.basketItems.has(app.previewProductId),
		}),
	});
});

events.on(AppModals.basket, () => {
	modal.render({
		content: basket.render({
			items: Array.from(app.basketItems.values()).map((item, idx) => {
				const basketItem = new Card(cloneTemplate(cardBasketTemplate), events);
				return basketItem.render({
					...item,
					basketItemIndex: idx + 1,
				});
			}),
			isDisabled: app.basketItems.size < 1,
			total: app.basketTotal,
		}),
	});
});

events.on(AppModals.orderInfo, () => {
	modal.render({
		content: orderInfoForm.render({
			...app.orderInfo,
			valid: !app.modalMessage,
			errors: '',
		}),
	});
});

events.on(AppModals.contacts, () => {
	modal.render({
		content: contactsForm.render({
			...app.contacts,
			valid: !app.modalMessage,
			errors: '',
		}),
	});
});

events.on(AppModals.success, () => {
	modal.render({
		content: success.render({}),
	});
});

app.loadProducts();
