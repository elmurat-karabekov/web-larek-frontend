import { IOrderInfo } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Form } from './common/Form';

export class OrderInfoForm extends Form<IOrderInfo> {
	protected _selectMethodButtons: HTMLElement;
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this._selectMethodButtons = ensureElement<HTMLElement>(
			'.order__buttons',
			this.container
		);

		this._cardButton = ensureElement<HTMLButtonElement>(
			"button[name='card']",
			this._selectMethodButtons
		);

		this._cashButton = ensureElement<HTMLButtonElement>(
			"button[name='cash']",
			this._selectMethodButtons
		);

		this._selectMethodButtons.addEventListener('click', (e) => {
			const target = e.target as HTMLButtonElement;
			if (target.classList.contains('button_alt')) {
				const field = 'payment';
				const value = target.name;
				super.onInputChange(field, value);
			}
		});
	}

	set payment(value: 'card' | 'cash') {
		const isCard = value === 'card';

		this.toggleClass(this._cardButton, 'button_alt-active', isCard);
		this.toggleClass(this._cashButton, 'button_alt-active', !isCard);
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
