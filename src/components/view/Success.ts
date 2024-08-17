import { ISuccessProps, UIActions } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Success extends Component<ISuccessProps> {
	protected _orderDescription: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this._orderDescription = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		this._closeButton.addEventListener('click', () => {
			this.events.emit(UIActions.closeOrderSuccees);
		});
	}

	set total(value: number) {
		this._orderDescription.textContent = `Списано ${value} синапсов`;
	}
}
