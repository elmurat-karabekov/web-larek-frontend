import {
	AppStateChanges,
	AppModals,
	IAppState,
	IContacts,
	ILarekApi,
	IOrder,
	IOrderInfo,
	IOrderResult,
	IProduct,
} from '../../types';
import { IEvents } from '../base/events';

export class AppState implements IAppState {
	products: Map<string, IProduct> = new Map<string, IProduct>();
	basketItems: Map<string, IProduct> = new Map<string, IProduct>();

	orderInfo: IOrderInfo = {
		method: 'card', // default payment method
		address: '',
	};

	contacts: IContacts = {
		email: '',
		phone: '',
	};

	previewProductId: string | null = null;

	previousModal: AppModals = AppModals.none;
	currentModal: AppModals = AppModals.none;
	modalMessage = '';
	isValid = false;

	constructor(protected api: ILarekApi, protected events: IEvents) {}

	get basketTotal(): number {
		return Array.from(this.basketItems.values()).reduce<number>(
			(acc, product) => acc + product.price,
			0
		);
	}

	get order(): IOrder {
		return {
			...this.orderInfo,
			...this.contacts,
			total: this.basketTotal,
			items: Array.from(this.basketItems.values()).map<string>(
				(product) => product.id
			),
		};
	}

	// api actions
	async loadProducts(): Promise<void> {
		this.products.clear();
		const products = await this.api.getProducts();

		for (const product of products) {
			this.products.set(product.id, product);
		}
		this.events.emit(AppStateChanges.products);
	}

	async orderProducts(): Promise<IOrderResult> {
		try {
			const result = await this.api.orderProducts(this.order);
			this.basketItems.clear();
			this.events.emit(AppStateChanges.basketItems);
			return result;
		} catch (err: unknown) {
			if (err instanceof Error) {
				this.modalMessage = err.message;
			}
			if (typeof err === 'string') {
				this.modalMessage = err;
			}
		}
	}

	// user actions
	addProductToBasket(id: string): void {
		if (
			this.products.has(id) &&
			this.products.get(id).price &&
			!this.basketItems.has(id)
		) {
			this.basketItems.set(id, this.products.get(id));
			this.events.emit(AppStateChanges.basketItems);
		} else {
			throw new Error(
				`Product ${id} does not exist or already in basket or is invaluable`
			);
		}
	}

	removeProductFromBasket(id: string): void {
		if (this.basketItems.has(id)) {
			this.basketItems.delete(id);
			this.events.emit(AppStateChanges.basketItems);
		} else {
			throw new Error(`Product ${id} does not exist in the basket`);
		}
	}

	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void {
		this.orderInfo = {
			...this.orderInfo,
			...orderInfo,
		};
		this.modalMessage = this.validateOrderInfo(orderInfo);
		// this.onChange(AppStateChanges.orderInfo);
	}

	fillContacts(contacts: Partial<IContacts>): void {
		this.contacts = {
			...this.contacts,
			...contacts,
		};
		this.modalMessage = this.validateContacts(contacts);
		// this.onChange(AppStateChanges.contacts);
	}

	openModal(modal: AppModals, previewId?: string): void {
		switch (modal) {
			case AppModals.preview:
				if (!previewId) {
					this.previewProductId = null;
					throw new Error(`No product selected for preview`);
				}
				this.previewProductId = previewId;
				break;
			case AppModals.orderInfo:
				if (this.basketItems.size === 0) {
					throw new Error(`No products selected for purchase`);
				}
				break;
		}
		if (this.currentModal !== modal) {
			this.currentModal = modal;
			// this.onChange(AppStateChanges.modal);
		}
	}

	protected validateOrderInfo(orderInfo: Partial<IOrderInfo>): string | null {
		let error = '';

		if (!orderInfo.method || !orderInfo.address) {
			error = 'Адрес доставки обязательное поле.';
		}

		return error;
	}

	protected validateContacts(contacts: Partial<IContacts>): string {
		const errors: string[] = [];
		if (!contacts.email || !contacts.phone) {
			errors.push('Email и телефон обязательные поля');
		}
		if (
			contacts.email &&
			!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(contacts.email)
		) {
			errors.push('Некорректный email');
		}
		if (contacts.phone && !/^\+?[0-9]{10,14}$/.test(contacts.phone)) {
			errors.push('Некорректный телефон');
		}
		if (errors.length) {
			return errors.join('. ') + '.';
		}
		return '';
	}
}
