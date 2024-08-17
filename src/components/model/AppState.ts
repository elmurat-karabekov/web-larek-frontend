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
		payment: 'card', // default payment method
		address: '',
	};

	contacts: IContacts = {
		email: '',
		phone: '',
	};

	previewProductId: string | null = null;

	previousModal: AppModals = AppModals.none;
	currentModal: AppModals = AppModals.none;
	protected _modalMessage = '';

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

	get modalMessage() {
		return this._modalMessage;
	}

	// api actions
	async loadProducts(): Promise<void> {
		this.products.clear();
		const products = await this.api.getProducts();

		for (const product of products) {
			this.products.set(product.id, product);
		}
		this.events.emit(
			AppStateChanges.products,
			Array.from(this.products.values())
		);
	}

	async orderProducts(): Promise<IOrderResult> {
		try {
			const result = await this.api.orderProducts(this.order);
			this.basketItems.clear();
			this.events.emit(AppStateChanges.orderSuccess, { total: result.total });
			this.events.emit(AppStateChanges.basketItems);
			return result;
		} catch (err: unknown) {
			if (err instanceof Error) {
				this._modalMessage = err.message;
			}
			if (typeof err === 'string') {
				this._modalMessage = err;
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

		this._modalMessage = this.validateOrderInfo(this.orderInfo);
		this.events.emit(AppStateChanges.orderInfo);
	}

	fillContacts(contacts: Partial<IContacts>): void {
		this.contacts = {
			...this.contacts,
			...contacts,
		};
		this._modalMessage = this.validateContacts(this.contacts);
		this.events.emit(AppStateChanges.contacts);
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
				this._modalMessage = this.validateOrderInfo(this.orderInfo);
				break;
			case AppModals.contacts:
				if (this.validateOrderInfo(this.orderInfo)) {
					throw new Error(`Order information is incorrect`);
				}
				this._modalMessage = this.validateContacts(this.contacts);
				break;
		}
		if (this.currentModal !== modal) {
			this.currentModal = modal;
			this.events.emit(AppStateChanges.modal, {
				previous: this.previousModal,
				current: this.currentModal,
			});
			this.events.emit(this.currentModal);
			this.previousModal = this.currentModal;
		}
	}

	clearFormValidation() {
		this._modalMessage = '';
	}

	protected validateOrderInfo(orderInfo: Partial<IOrderInfo>): string {
		let error = '';

		if (!orderInfo.payment || !orderInfo.address) {
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
