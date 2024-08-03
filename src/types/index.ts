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
