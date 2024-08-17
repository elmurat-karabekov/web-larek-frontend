import { IBasketProps, UIActions } from '../../types';
import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Basket extends Component<IBasketProps> {
	protected _items: HTMLElement;
	protected _total: HTMLElement;
	protected _next: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._items = ensureElement<HTMLElement>('.basket__list', container);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._next = ensureElement<HTMLButtonElement>('.basket__button', container);

		this._next.addEventListener('click', () =>
			this.events.emit(UIActions.openOrderInfo)
		);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._items.replaceChildren(...items);
		} else {
			this._items.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	set isDisabled(state: boolean) {
		this._next.disabled = state;
	}

	set total(total: number) {
		this.setText(this._total, total ? `${total} синапсов` : '');
	}
}
