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

export interface IBasketItem {
	id: string;
	title: string;
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

export type TFormStatus = {
	message: string;
	valid: boolean;
};

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

export enum AppStateChanges {
	appInitLoad = 'change:appInitLoad',
	products = 'change:products',
	basketItems = 'change:basketItems',
	orderInfo = 'change:orderInfo',
	contacts = 'change:contacts',
	orderSuccess = 'change:orderSuccess',
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
	openModal = 'ui:openModal',
	closeModal = 'ui:closeModal',
}

// Интерфейс модели данных приложения
export interface IAppState {
	// Загружаемые с сервера данные
	products: Map<string, IProduct>;

	// Заполняемые пользователем данные
	basketItems: Map<string, IBasketItem>;
	basketTotal: number;
	orderInfo: IOrderInfo;
	contacts: IContacts;
	order: IOrder;

	// Состояние интерфейса
	formStatus: TFormStatus;

	// Методы для работы с данными
	setProducts(products: IProduct[]): void;
	addProductToBasket(id: string): void;
	removeProductFromBasket(id: string): void;
	clearBasket(): void;
	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void;
	fillContacts(contacts: Partial<IContacts>): void;
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
