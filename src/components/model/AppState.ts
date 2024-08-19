import {
	AppStateChanges,
	IAppState,
	IContacts,
	IOrder,
	IOrderInfo,
	IProduct,
	IBasketItem,
	TFormStatus,
} from '../../types';
import { IEvents } from '../base/events';

export class AppState implements IAppState {
	products: Map<string, IProduct> = new Map<string, IProduct>();
	basketItems: Map<string, IBasketItem> = new Map<string, IBasketItem>();

	orderInfo: IOrderInfo = {
		payment: 'card', // default payment method
		address: '',
	};

	contacts: IContacts = {
		email: '',
		phone: '',
	};

	formStatus: TFormStatus = {
		message: '',
		valid: false,
	};

	constructor(protected events: IEvents) {}

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

	setProducts(products: IProduct[]): void {
		this.products.clear();
		for (const product of products) {
			this.products.set(product.id, product);
		}
	}

	addProductToBasket(id: string): void {
		if (
			this.products.has(id) &&
			this.products.get(id).price &&
			!this.basketItems.has(id)
		) {
			this.basketItems.set(
				id,
				this.formatBasketItemData(this.products.get(id))
			);
			this.events.emit(
				AppStateChanges.basketItems,
				Array.from(this.basketItems.values())
			);
		} else {
			throw new Error(
				`Product ${id} does not exist or already in basket or is invaluable`
			);
		}
	}

	removeProductFromBasket(id: string): void {
		if (this.basketItems.has(id)) {
			this.basketItems.delete(id);
			this.events.emit(
				AppStateChanges.basketItems,
				Array.from(this.basketItems.values())
			);
		} else {
			throw new Error(`Product ${id} does not exist in the basket`);
		}
	}

	clearBasket(): void {
		this.basketItems.clear();
		this.events.emit(AppStateChanges.basketItems, []);
	}

	resetForms(): void {
		this.orderInfo = {
			payment: 'card', // default payment method
			address: '',
		};

		this.contacts = {
			email: '',
			phone: '',
		};
	}

	fillOrderInfo(orderInfo: Partial<IOrderInfo>): void {
		this.orderInfo = {
			...this.orderInfo,
			...orderInfo,
		};
		this.validateOrderInfo(this.orderInfo);
	}

	fillContacts(contacts: Partial<IContacts>): void {
		this.contacts = {
			...this.contacts,
			...contacts,
		};
		this.validateContacts(this.contacts);
	}

	clearFormValidation() {
		this.formStatus = {
			message: '',
			valid: false,
		};
	}

	formatBasketItemData({ id, title, price, ...rest }: IProduct): IBasketItem {
		return { id, title, price };
	}

	protected validateOrderInfo(orderInfo: Partial<IOrderInfo>): void {
		let error = '';

		if (!orderInfo.payment || !orderInfo.address) {
			error = 'Адрес доставки обязательное поле.';
		}

		this.formStatus.message = error;
		this.formStatus.valid = !error; // Boolean('') = false
	}

	protected validateContacts(contacts: Partial<IContacts>): void {
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
			this.formStatus = {
				message: errors.join('. ') + '.',
				valid: false,
			};
		} else {
			this.formStatus = {
				message: '',
				valid: true,
			};
		}
	}
}
