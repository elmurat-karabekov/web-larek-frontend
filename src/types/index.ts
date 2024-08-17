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
	payment: 'card' | 'cash';
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

export enum AppModals {
	preview = 'modal:preview',
	basket = 'modal:basket',
	orderInfo = 'modal:orderInfo',
	contacts = 'modal:contacts',
	success = 'modal:success',
	none = 'modal:none',
}

export enum AppStateChanges {
	products = 'change:products',
	previewProduct = 'change:previewProduct',
	modal = 'change:modal',
	modalMessage = 'change:modalMessage',
	basketItems = 'change:basketItems',
	orderInfo = 'change:orderInfo',
	contacts = 'change:contacts',
	orderSuccess = 'change:orderSuccess,',
}

export enum UIActions {
	openBasket = 'ui:openBasket',
	openPreview = 'ui:openPreview',
	cardButtonAction = 'ui:cardButtonAction',
	removeProduct = 'ui:removeProduct',
	openOrderInfo = 'ui:openOrderInfo',
	fillOrderInfo = 'ui:fillOrderInfo',
	fillContacts = 'ui:fillContacts',
	submitOrderInfo = 'ui:submitOrderInfo',
	submitContacts = 'ui:submitContacts',
	closeOrderSuccees = 'ui:closeOrderSuccess',
	closeModal = 'ui:closeModal',
	goBack = 'ui:goBack',
}

// Интерфейс модели данных приложения
export interface IAppState {
	// Загружаемые с сервера данные
	products: Map<string, IProduct>;

	// Заполняемые пользователем данные
	basketItems: Map<string, IProduct>;
	basketTotal: number;
	orderInfo: IOrderInfo;
	contacts: IContacts;
	order: IOrder;

	// Состояние интерфейса
	previewProductId: string | null;
	previousModal: AppModals;
	currentModal: AppModals;
	modalMessage: string;

	// Действия с API
	loadProducts(): Promise<void>;
	orderProducts(): Promise<IOrderResult>;

	// Пользовательские действия
	addProductToBasket(id: string): void;
	removeProductFromBasket(id: string): void;
	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void;
	fillContacts(contacts: Partial<IContacts>): void;

	// Методы для работы с модальными окнами
	openModal(modal: AppModals, previewId?: string): void;
}

// Интерфейсы классов отображения
export interface ICardProps extends IProduct {
	isInBasket: boolean;
	basketItemIndex: number;
}

export interface IBasketProps {
	items: HTMLElement[];
	isDisabled: boolean;
	total: number;
}

export interface ISuccessProps {
	total: number;
}
