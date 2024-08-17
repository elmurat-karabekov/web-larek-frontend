import { UIActions } from '../../../types';
import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';
import { IEvents } from '../../base/events';

interface IModalData {
	content: HTMLElement;
	open: boolean;
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);

		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	set open(isOpen: boolean) {
		this.toggleClass(this.container, 'modal_active', isOpen);
	}

	close() {
		this.content = null;
		this.events.emit(UIActions.closeModal);
	}

	render(data: Partial<IModalData>): HTMLElement {
		super.render(data);
		return this.container;
	}
}
