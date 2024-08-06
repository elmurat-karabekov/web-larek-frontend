import { ICard, UIActions } from '../../types';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Card extends Component<ICard> {
	protected events: IEvents;
	protected cardCategory: HTMLSpanElement;
	protected cardTitle: HTMLElement;
	protected cardImage: HTMLImageElement;
	protected cardPrice: HTMLSpanElement;
	protected cardId: string;

	constructor(protected container: HTMLButtonElement, events: IEvents) {
		super(container);
		this.events = events;

		this.cardCategory = this.container.querySelector('.card__category');
		this.cardTitle = this.container.querySelector('.card__title');
		this.cardImage = this.container.querySelector('.card__image');
		this.cardPrice = this.container.querySelector('.card__price');

		this.container.addEventListener('click', () =>
			this.events.emit(UIActions.openPreview, { id: this.cardId })
		);
	}

	set category(category: string) {
		this.cardCategory.textContent = category;

		switch (category) {
			case 'софт-скил':
				this.cardCategory.classList.add('card__category_soft');
				break;
			case 'хард-скил':
				this.cardCategory.classList.add('card__category_hard');
				break;
			case 'другое':
				this.cardCategory.classList.add('card__category_other');
				break;
			case 'дополнительное':
				this.cardCategory.classList.add('card__category_additional');
				break;
			case 'кнопка':
				this.cardCategory.classList.add('card__category_button');
				break;
			default:
				break;
		}
	}

	set image(url: string) {
		this.cardImage.src = url;
	}

	set title(title: string) {
		this.cardTitle.textContent = title;
	}

	set price(price: string) {
		this.cardPrice.textContent = price;
	}

	set _id(id) {
		this.cardId = id;
	}
	get _id() {
		return this.cardId;
	}
}
