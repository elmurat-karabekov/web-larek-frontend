import {
	AppStateChanges,
	AppStateModals,
	IAppState,
	IContacts,
	ILarekApi,
	IOrder,
	IOrderInfo,
	IOrderResult,
	IProduct,
} from '../../types';

export class AppState implements IAppState {
	products: Map<string, IProduct> = new Map<string, IProduct>();
	basket: Map<string, IProduct> = new Map<string, IProduct>();

	orderInfo: IOrderInfo = {
		payment: '',
		address: '',
	};
	contacts: IContacts = {
		email: '',
		phone: '',
	};

	previewProductId: string | null = null;
	openedModal: AppStateModals = AppStateModals.none;
	modalMessage: string | null = null;
	isError = false;

	constructor(
		protected api: ILarekApi,
		protected onChange: (changed: AppStateChanges) => void
	) {}

	get basketTotal(): number {
		return Array.from(this.basket.values()).reduce<number>(
			(acc, product) => acc + product.price,
			0
		);
	}

	get order(): IOrder {
		return {
			...this.orderInfo,
			...this.contacts,
			total: this.basketTotal,
			items: Array.from(this.basket.values()).map<string>(
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
		this.onChange(AppStateChanges.products);
	}

	async orderProducts(): Promise<IOrderResult> {
		try {
			const result = await this.api.orderProducts(this.order);
			this.basket.clear();
			this.onChange(AppStateChanges.basket);
			return result;
		} catch (err: unknown) {
			if (err instanceof Error) {
				this.setMessage(err.message, true);
			}
			if (typeof err === 'string') {
				this.setMessage(err, true);
			}
		}
	}

	// user actions
	addProductToBasket(id: string): void {
		if (
			this.products.has(id) &&
			this.products.get(id).price &&
			!this.basket.has(id)
		) {
			this.basket.set(id, this.products.get(id));
			this.onChange(AppStateChanges.basket);
		} else {
			throw new Error(
				`Product ${id} does not exist or already in basket or is invaluable`
			);
		}
	}

	removeProductFromBasket(id: string): void {
		if (this.basket.has(id)) {
			this.basket.delete(id);
			this.onChange(AppStateChanges.basket);
		} else {
			throw new Error(`Product ${id} does not exist in the basket`);
		}
	}

	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void {
		this.orderInfo = {
			...this.orderInfo,
			...orderInfo,
		};
		this.onChange(AppStateChanges.orderInfo);
	}

	isValidOrderInfo(): boolean {
		const error = this.validateOrderInfo(this.orderInfo);
		if (error) {
			this.setMessage(error, true);
			return false;
		} else {
			this.setMessage(null);
			return true;
		}
	}

	fillContacts(contacts: Partial<IContacts>): void {
		this.contacts = {
			...this.contacts,
			...contacts,
		};
		this.onChange(AppStateChanges.contacts);
	}

	isValidContacts(): boolean {
		const error = this.validateContacts(this.contacts);
		if (error) {
			this.setMessage(error, true);
			return false;
		} else {
			this.setMessage(null);
			return true;
		}
	}

	openModal(modal: AppStateModals, previewId?: string): void {
		switch (modal) {
			case AppStateModals.preview:
				if (!previewId) {
					this.previewProductId = null;
					throw new Error(`No product selected for preview`);
				}
				this.previewProductId = previewId;
				break;
			case AppStateModals.orderInfo:
				if (this.basket.size === 0) {
					throw new Error(`No products selected for purchase`);
				}
				break;
		}
		if (this.openedModal !== modal) {
			this.openedModal = modal;
			this.onChange(AppStateChanges.modal);
		}
	}

	protected validateOrderInfo(orderInfo: Partial<IOrderInfo>): string | null {
		let error: string;

		if (!orderInfo.payment || !orderInfo.address) {
			error = 'Email и телефон обязательные поля.';
		}

		return error || null;
	}

	protected validateContacts(contacts: Partial<IContacts>): string | null {
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
		return null;
	}

	setMessage(message: string | null, isError = false): void {
		this.modalMessage = message;
		this.isError = isError;
		this.onChange(AppStateChanges.modalMessage);
	}
}
