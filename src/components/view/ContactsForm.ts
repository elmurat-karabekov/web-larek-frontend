import { IContacts } from '../../types';
import { IEvents } from '../base/events';
import { Form } from './common/Form';

export class ContactsForm extends Form<IContacts> {
	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
