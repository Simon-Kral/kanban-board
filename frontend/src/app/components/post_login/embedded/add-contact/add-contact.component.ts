import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DbService } from '../../../../services/db/db.service';
import { Contact } from '../../../../models/contact.class';
import { NgClass } from '@angular/common';
import { UtilityService } from '../../../../services/utitily/utility.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ContactInterface } from '../../../../interfaces/contact';

/**
 * Validator function to ensure that the input is a full name consisting of at least a first and last name.
 * @param control - The AbstractControl containing the value to validate.
 * @returns A ValidationErrors object if the name is not a full name; otherwise, null.
 */
export const nameIsFullNameValidator = (control: AbstractControl): ValidationErrors | null => {
	const pattern = /[\u00C0-\u017Fa-zA-Z-']+(\s{1}[\u00C0-\u017Fa-zA-Z-']+)+/gu;
	return !pattern.test(control.value) ? { nameIsFullName: 'Please enter your full name.' } : null;
};

@Component({
	selector: 'app-add-contact',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass],
	templateUrl: './add-contact.component.html',
	styleUrl: './add-contact.component.scss',
})
export class AddContactComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
	color: string = this.colors[Math.floor(Math.random() * this.colors.length)];

	addContactForm = this.fb.group({
		name: ['', [Validators.required, nameIsFullNameValidator]],
		email: ['', [Validators.required, Validators.email]],
		phone: ['', []],
	});

	/**
	 * Initializes the component and resets any backend errors in the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Form

	/**
	 * Handles the form submission process, including adding the new contact.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		await this.addContact();
		this.utilityService.loading = false;
	}

	/**
	 * Adds a new contact by creating a Contact object and sending it to the database.
	 */
	async addContact(): Promise<void> {
		try {
			const newContact = this.createContactObj();
			let resp = await this.dbService.postContact(newContact);
			this.completeContactAdd(resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}

	// Data

	/**
	 * Creates a Contact object from the form data to be submitted to the database.
	 * @returns A new Contact object containing the information provided in the form.
	 */
	createContactObj(): Contact {
		const rawData = this.addContactForm.getRawValue();
		const [first_name, last_name] = this.utilityService.separateUserName(rawData.name);
		const contact = new Contact(
			{
				first_name: first_name,
				last_name: last_name,
				email: rawData.email,
				phone: rawData.phone,
				color: this.color,
			},
			this.authService.currentUserSig()!.id,
		);
		return contact;
	}

	/**
	 * Completes the contact addition process by updating the contacts signal and notifying the user.
	 * @param resp - The ContactInterface response from the database containing the newly created contact's data.
	 */
	completeContactAdd(resp: ContactInterface): void {
		const newContact = new Contact(resp);
		this.utilityService.addToSignal(this.dbService.contactsSig, newContact);
		this.utilityService.hideOverlay();
		this.utilityService.notificateUser('Contact successfully created');
	}
}
