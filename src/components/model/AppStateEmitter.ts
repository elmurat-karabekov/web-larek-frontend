import {
	IAppState,
	AppStateModals,
	ILarekApi,
	AppStateConstructor,
	AppStateChanges,
} from '../../types';
import { IEvents } from '../base/events';

export class AppStateEmitter {
	public model: IAppState;
	protected previousModal: AppStateModals = AppStateModals.none;

	constructor(
		protected broker: IEvents,
		api: ILarekApi,
		Model: AppStateConstructor
	) {
		this.model = new Model(api, this.onModelChange.bind(this));
	}

	protected onModelChange(changed: AppStateChanges) {
		switch (changed) {
			case AppStateChanges.modal:
				this.broker.emit(changed, {
					previous: this.previousModal,
					current: this.model.openedModal,
				});
				this.broker.emit(this.model.openedModal);
				this.previousModal = this.model.openedModal;
				break;
			case AppStateChanges.basket:
				this.broker.emit(changed, {
					items: Array.from(this.model.basket.values()),
				});
				break;
			case AppStateChanges.products:
				this.broker.emit(changed, Array.from(this.model.products.values()));
				break;
			case AppStateChanges.orderInfo:
				this.broker.emit(changed, this.model.orderInfo);
				break;
			case AppStateChanges.contacts:
				this.broker.emit(changed, this.model.contacts);
				break;
			case AppStateChanges.modalMessage:
				this.broker.emit(changed, {
					message: this.model.modalMessage,
					isError: this.model.isError,
				});
				break;
			default:
				break;
		}
	}
}
