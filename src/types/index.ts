export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export type HttpMethods = 'POST' | 'PUT' | 'DELETE';

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IOrderInfo {
	payment: string;
	address: string;
}

export interface IContacts {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderInfo, IContacts {
	total: number;
	items: string[];
}

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IApi {
	baseUrl: string;
	get<T>(uri: string): Promise<T>;
	post<T>(uri: string, data: object, method?: HttpMethods): Promise<T>;
}

// Интерфейс API-клиента
export interface ILarekApi {
	getProducts: () => Promise<IProduct[]>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export enum AppStateModals {
	preview = 'modal:preview',
	basket = 'modal:basket',
	orderInfo = 'modal:orderInfo',
	contacts = 'modal:contacts',
	success = 'modal:success',
	none = 'modal:none',
}

export enum AppStateChanges {
	products = 'change:products', // when list of product is loaded: [] => [.., .., ...]
	previewProduct = 'change:previewProduct', // when a product is selected for preview
	modal = 'change:modal', // open/close modal
	modalMessage = 'change:modalMessage', // errors
	basket = 'change:basket', // add/remove product from the basket
	orderInfo = 'change:orderInfo',
	contacts = 'change:contacts',
}

export enum UIActions {
	openBasket = 'ui:openBasket',
	openPreview = 'ui:openPreview',
	removeTicket = 'ui:removeTicket',
	fillContacts = 'ui:fillContacts',
	makeOrder = 'ui:makeOrder',
	closeModal = 'ui:closeModal',
	goBack = 'ui:goBack',
}

// Интерфейс модели данных приложения
export interface IAppState {
	// Загружаемые с сервера данные
	products: Map<string, IProduct>;

	// Заполняемые пользователем данные
	basket: Map<string, IProduct>;
	basketTotal: number;
	orderInfo: IOrderInfo;
	contacts: IContacts;
	order: IOrder;

	// Состояние интерфейса
	previewedProductId: string | null;
	openedModal: AppStateModals;
	modalMessage: string | null;
	isError: boolean;

	// Действия с API
	loadProducts(): Promise<void>;
	orderProducts(): Promise<IOrderResult>;

	// Пользовательские действия
	previewProduct(id: string): void;
	addProductToBasket(id: string): void;
	removeProductFromBasket(id: string): void;
	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void;
	isValidOrderInfo(): boolean;
	fillContacts(contacts: Partial<IContacts>): void;
	isValidContacts(): boolean;

	// Вспомогательные методы
	formatCurrency(value: number): string;

	// Методы для работы с модальными окнами
	openModal(modal: AppStateModals): void;
	setMessage(message: string | null, isError: boolean): void;
}

export interface AppStateConstructor {
	new (api: ILarekApi, onChange: (changed: AppStateChanges) => void): IAppState;
}

// Классы отображения
export interface ICard {
	category: string;
	title: string;
	image: string;
	price: string;
	_id: string;
}
