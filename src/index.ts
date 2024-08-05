import { AppState } from './components/AppState';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { LarekApi } from './components/LarekApi';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

const events = new EventEmitter();

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi, CDN_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
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
