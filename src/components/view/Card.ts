import { ICardProps, IProduct, UIActions } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Card extends Component<ICardProps> {
	// TODO: Component<T> - T???
	protected events: IEvents;

	protected _id: string;
	protected _title: HTMLElement;
	protected _price: HTMLElement;

	protected _cardImage?: HTMLImageElement;
	protected _cardCategory?: HTMLElement;
	protected _cardPreviewDescription?: HTMLElement;
	protected _basketItemIndex?: HTMLElement;
	protected _cardPreviewButton?: HTMLButtonElement;
	protected _basketItemDeleteButton?: HTMLButtonElement;

	constructor(protected container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events;

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);

		// ensure emlements specific to Card Class implementations
		this.ensureCardElements.call(this, container);
		this.ensureCardPreviewElements.call(this, container);
		this.ensureBasketItemElements.call(this, container);

		if (this.container.classList.contains('card_catalog')) {
			this.container.addEventListener('click', () =>
				this.events.emit(UIActions.openPreview, { id: this._id })
			);
		}

		if (this.container.classList.contains('card_full')) {
			this._cardPreviewButton.addEventListener('click', () =>
				this.events.emit(UIActions.cardButtonAction, { id: this._id })
			);
		}

		if (this.container.classList.contains('card_compact')) {
			this._basketItemDeleteButton.addEventListener('click', () => {
				this.events.emit(UIActions.removeProduct, { id: this._id });
			});
		}
	}

	set id(id) {
		this._id = id;
	}

	get id() {
		return this._id;
	}

	set title(title: string) {
		this._title.textContent = title;
	}

	set price(price: number | null) {
		if (this._cardPreviewButton) {
			this.setDisabled(this._cardPreviewButton, !price);
		}
		this._price.textContent = price ? `${price} синапсов` : 'Бесценно';
	}

	set category(category: string) {
		if (this._cardCategory) {
			this._cardCategory.textContent = category;

			switch (category) {
				case 'софт-скил':
					this._cardCategory.classList.add('card__category_soft');
					break;
				case 'хард-скил':
					this._cardCategory.classList.add('card__category_hard');
					break;
				case 'другое':
					this._cardCategory.classList.add('card__category_other');
					break;
				case 'дополнительное':
					this._cardCategory.classList.add('card__category_additional');
					break;
				case 'кнопка':
					this._cardCategory.classList.add('card__category_button');
					break;
				default:
					break;
			}
		}
	}

	set image(url: string) {
		if (this._cardImage) this._cardImage.src = url;
	}

	set description(description: string) {
		if (this._cardPreviewDescription)
			this._cardPreviewDescription.textContent = description;
	}

	set isInBasket(isInBasket: boolean) {
		if (this._cardPreviewButton) {
			if (!isInBasket) {
				this._cardPreviewButton.textContent = 'Купить';
				this._cardPreviewButton.classList.add('card__button_is-active');
			} else {
				this._cardPreviewButton.textContent = 'Убрать';
				this._cardPreviewButton.classList.remove('card__button_is-active');
			}
		}
	}

	set basketItemIndex(index: number) {
		if (this._basketItemIndex) {
			this._basketItemIndex.textContent = String(index);
		}
	}

	// utility methods
	ensureCardElements(container: HTMLElement) {
		if (
			container.classList.contains('card_catalog') ||
			container.classList.contains('card_full')
		) {
			this._cardCategory = ensureElement<HTMLElement>(
				'.card__category',
				container
			);
			this._cardImage = ensureElement<HTMLImageElement>(
				'.card__image',
				container
			);
		}
	}

	ensureCardPreviewElements(container: HTMLElement) {
		if (container.classList.contains('card_full')) {
			this._cardPreviewDescription = ensureElement<HTMLElement>(
				'.card__text',
				container
			);

			this._cardPreviewButton = ensureElement<HTMLButtonElement>(
				'.card__button',
				container
			);
		}
	}

	ensureBasketItemElements(container: HTMLElement) {
		if (container.classList.contains('card_compact')) {
			this._basketItemIndex = ensureElement<HTMLElement>(
				'.basket__item-index',
				container
			);

			this._basketItemDeleteButton = ensureElement<HTMLButtonElement>(
				'.card__button',
				container
			);
		}
	}
}
