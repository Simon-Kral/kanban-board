import { ContactInterface } from '../interfaces/contact';

export class Contact {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	initials: string;
	color: string;
	phone: string;

	constructor(contact: ContactInterface) {
		this.id = contact.id;
		this.email = contact.email;
		this.first_name = contact.first_name;
		this.last_name = contact.last_name;
		this.initials = this.first_name[0].toUpperCase() + this.last_name[0].toUpperCase();
		this.color = contact.color;
		this.phone = contact.phone;
	}
}
