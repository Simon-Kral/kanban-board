import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { DbService } from '../../../../services/db/db.service';
import { Contact } from '../../../../models/contact.class';
import { ContactInterface } from '../../../../interfaces/contact';
import { UtilityService } from '../../../../services/utitily/utility.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { UserInterface } from '../../../../interfaces/user';

/**
 * Validator function to ensure that the input is a full name consisting of at least a first and last name.
 * @param control - The AbstractControl containing the value to validate.
 * @returns A ValidationErrors object if the name is not a full name; otherwise, null.
 */
export const nameIsFullNameValidator = (control: AbstractControl): ValidationErrors | null => {
	const pattern = /[\u00C0-\u017Fa-zA-Z']+(\s{1}[\u00C0-\u017Fa-zA-Z']+)+/gu;
	return !pattern.test(control.value) ? { nameIsFullName: 'Please enter your full name.' } : null;
};

/**
 * Validator function to check if an email already exists among contacts, except for the current user's email.
 * @param contacts - An array of Contact objects to check against.
 * @param data - The current user's data, including email.
 * @returns A ValidatorFn that checks if the email already exists in contacts.
 */
export const emailExistsValidator = (contacts: Contact[], data: UserInterface): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		let hasChanged: boolean = control.value != data.email;
		let isInContacts: boolean = contacts.filter((contact) => contact.email === control.value).length > 0;
		return hasChanged && isInContacts ? { emailExists: 'This email already exists.' } : null;
	};
};

@Component({
	selector: 'app-edit-contact',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass],
	templateUrl: './edit-contact.component.html',
	styleUrl: './edit-contact.component.scss',
})
export class EditContactComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	editContactForm = this.fb.group({
		name: [this.utilityService.dataSig().first_name + ' ' + this.utilityService.dataSig().last_name, [Validators.required, nameIsFullNameValidator]],
		email: [this.utilityService.dataSig().email, [Validators.required, Validators.email, emailExistsValidator(this.dbService.contactsSig(), this.utilityService.dataSig())]],
		phone: [this.utilityService.dataSig().phone, []],
	});

	/**
	 * Initializes the component and resets any backend errors in the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Form

	/**
	 * Handles the form submission process, including editing the contact.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		await this.editContact();
		this.utilityService.loading = false;
	}

	/**
	 * Edits the current contact by updating the user's information and sending the updated contact data to the database.
	 */
	async editContact(): Promise<void> {
		try {
			if (this.contactIsCurrentUser()) {
				await this.updateCurrentUser();
			}
			const newContact = this.createContactObj();
			let resp = await this.dbService.updateContact(newContact);
			this.completeContactEdit(resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}

	/**
	 * Deletes the current contact from the database.
	 */
	async deleteContact(): Promise<void> {
		this.utilityService.loading = true;
		try {
			const id = this.utilityService.dataSig()!.id;
			await this.dbService.deleteContact(id);
			this.completeContactDelete(id);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	/**
	 * Checks if the current contact being edited is the same as the logged-in user.
	 * @returns True if the contact is the current user; otherwise, false.
	 */
	contactIsCurrentUser(): boolean {
		return this.utilityService.dataSig().email === this.authService.currentUserSig()!.email;
	}

	/**
	 * Updates the logged-in user's information in the system.
	 */
	async updateCurrentUser(): Promise<void> {
		const newUser = this.createUserObj();
		let resp = await this.authService.postUser(newUser);
		this.authService.currentUserSig.update((user) => resp.user);
	}

	// Data

	/**
	 * Creates a Contact object from the form data to be submitted to the database.
	 * @returns A Contact object containing the updated contact information.
	 */
	createContactObj(): Contact {
		const rawData = this.editContactForm.getRawValue();
		const selectedContact = this.utilityService.dataSig()!;
		const [first_name, last_name] = this.utilityService.separateUserName(rawData.name);
		const contact = {
			id: selectedContact.id,
			email: rawData.email,
			first_name: first_name,
			last_name: last_name,
			initials: selectedContact.initials,
			color: selectedContact.color,
			phone: rawData.phone,
		};
		return contact;
	}

	/**
	 * Creates a Partial UserInterface object from the form data to be submitted to the user management service.
	 * @returns A Partial<UserInterface> object containing the updated user information.
	 */
	createUserObj(): Partial<UserInterface> {
		const rawData = this.editContactForm.getRawValue();
		const [first_name, last_name] = this.utilityService.separateUserName(rawData.name);
		const user = {
			first_name: first_name,
			last_name: last_name,
			email: rawData.email,
		};
		return user;
	}

	/**
	 * Completes the contact edit process by updating the contacts signal and the utility service data.
	 * @param resp - The updated ContactInterface response from the database.
	 */
	completeContactEdit(resp: ContactInterface): void {
		const newContact = new Contact(resp);
		this.utilityService.updateInSignal(this.dbService.contactsSig, newContact);
		this.utilityService.dataSig.set(newContact);
		this.utilityService.hideOverlay(false);
	}

	/**
	 * Completes the contact deletion process by removing the contact from the contacts signal.
	 * @param id - The ID of the contact that was deleted.
	 */
	completeContactDelete(id: number): void {
		this.utilityService.removeFromSignal(this.dbService.contactsSig, id);
		this.utilityService.hideOverlay(true);
	}
}
