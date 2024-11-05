import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ContactInterface } from '../../interfaces/contact';
import { Contact } from '../../models/contact.class';
import { TaskInterface } from '../../interfaces/task';
import { DbService } from '../db/db.service';
import { SubtaskInterface } from '../../interfaces/subtask';
import { FormControl } from '@angular/forms';

@Injectable({
	providedIn: 'root',
})
export class UtilityService {
	dbService = inject(DbService);

	component: any | undefined = undefined;
	dataSig = signal<any | undefined>(undefined);

	taskStatus: string = 'todo';

	passwordType: string = 'password';
	passwordIcon: string = 'assets/img/lock.svg';

	loading: boolean = false;

	previousUrl: string = '';

	userMenu: boolean = false;
	moveMenu: boolean = false;
	contactOptionsMenu: boolean = false;

	notificate: boolean = false;
	notification: string = '';

	smallScreenView: boolean = false;
	contactsSidebarActive: boolean = true;
	contactsDetailsActive: boolean = false;

	constructor() {}

	// Signals

	/**
	 * Adds an item to a writable signal and sorts contacts if the item is a Contact instance.
	 * @param {WritableSignal<any>} sig - The signal to update.
	 * @param {any} resp - The response data to add to the signal.
	 */
	addToSignal(sig: WritableSignal<any>, resp: any): void {
		sig.update((elements) => {
			elements.push(resp);
			if (resp instanceof Contact) {
				this.sortContacts(elements);
			}
			return [...elements];
		});
	}

	/**
	 * Updates an existing item in a writable signal. If a taskId is provided, updates a subtask.
	 * @param {WritableSignal<any>} sig - The signal to update.
	 * @param {any} resp - The response data to update in the signal.
	 * @param {number} [taskId] - The ID of the task to update a subtask within.
	 */
	updateInSignal(sig: WritableSignal<any>, resp: any, taskId?: number): void {
		sig.update((elements) => {
			if (taskId) {
				this.updateSubtask(elements, resp, taskId);
			}
			const index = elements.findIndex((element: any) => element.id === resp.id);
			elements[index] = resp;
			return [...elements];
		});
	}

	/**
	 * Removes an item from a writable signal based on its ID.
	 * @param {WritableSignal<any>} sig - The signal to update.
	 * @param {number} id - The ID of the item to remove.
	 */
	removeFromSignal(sig: WritableSignal<any>, id: number): void {
		sig.update((elements) => {
			const index = elements.findIndex((element: any) => element.id === id);
			elements.splice(index, 1);
			return [...elements];
		});
	}

	/**
	 * Updates a subtask within a list of tasks.
	 * @param {TaskInterface[]} elements - The array of tasks.
	 * @param {SubtaskInterface} resp - The subtask data to update.
	 * @param {number} taskId - The ID of the task containing the subtask.
	 * @returns {TaskInterface[]} - The updated array of tasks.
	 */
	updateSubtask(elements: TaskInterface[], resp: SubtaskInterface, taskId: number): TaskInterface[] {
		let subtasks = elements.find((task: TaskInterface) => task.id === taskId)!.subtasks!;
		const index = subtasks.findIndex((subtask: any) => subtask.id === resp.id)!;
		subtasks[index] = resp;
		return [...elements];
	}

	// Form Validation

	/**
	 * Checks if a form control is invalid and has been touched or is dirty.
	 * @param {FormControl<string | boolean>} formControl - The form control to validate.
	 * @returns {boolean} - True if the form control is invalid and touched or dirty, otherwise false.
	 */
	formInvalid(formControl: FormControl<string | boolean>): boolean {
		return formControl.invalid && (formControl.touched || formControl.dirty);
	}

	// URL

	/**
	 * Stores the current URL as the previous URL.
	 * @param {string} url - The URL to store.
	 */
	storeUrl(url: string): void {
		this.previousUrl = url;
	}

	// Notification

	/**
	 * Notifies the user with a message for a short duration.
	 * @param {string} message - The notification message to display.
	 */
	notificateUser(message: string): void {
		this.notification = message;
		this.notificate = true;
		setTimeout(() => {
			this.notificate = false;
		}, 3000);
	}

	// Password Masking

	/**
	 * Toggles the password masking between 'password' and 'text' types and updates the icon accordingly.
	 */
	handlePasswordMasking(): void {
		if (this.passwordType === 'password') {
			this.passwordType = 'text';
			this.passwordIcon = 'assets/img/visibility.svg';
		} else {
			this.passwordType = 'password';
			this.passwordIcon = 'assets/img/visibility_off.svg';
		}
	}

	/**
	 * Handles the focus event on the password field, updating the icon if necessary.
	 */
	handlePasswordFieldFocus(): void {
		if (this.passwordIcon === 'assets/img/lock.svg') {
			this.passwordIcon = 'assets/img/visibility_off.svg';
		}
	}

	// Handle Data ( Get / Filter / Sort )

	/**
	 * Retrieves a specific parameter of a contact by its ID.
	 * @param {number} uid - The unique ID of the contact.
	 * @param {keyof Contact} key - The key of the contact property to retrieve.
	 * @returns {string | number} - The value of the specified contact property.
	 */
	getContactParamById(uid: number, key: keyof Contact): string | number {
		return this.dbService.contactsSig().find((contact) => contact.id === uid)![key]!;
	}

	/**
	 * Converts a priority number to its corresponding string representation.
	 * @param {number} prio - The priority number (1, 2, or 3).
	 * @returns {string} - The string representation of the priority ('urgent', 'medium', 'low').
	 */
	getPrioStrFromNr(prio: number): string {
		const map = new Map([
			[1, 'urgent'],
			[2, 'medium'],
			[3, 'low'],
		]);
		return map.get(prio)!;
	}

	/**
	 * Returns the appropriate background color style based on the category.
	 * @param {string} category - The category name.
	 * @returns {{ 'background-color': string }} - An object containing the background color style.
	 */
	getCategoryStyle(category: string): { 'background-color': string } {
		if (category === 'Technical Task') {
			return { 'background-color': '#1FD7C1' };
		} else if (category === 'User Story') {
			return { 'background-color': '#0038FF' };
		} else {
			return { 'background-color': 'black' };
		}
	}

	/**
	 * Creates an array of Contact instances from contact data.
	 * @param {ContactInterface[]} contactData - The array of contact data.
	 * @returns {Contact[]} - The array of Contact instances.
	 */
	createContacts(contactData: ContactInterface[]): Contact[] {
		let contacts: Contact[] = [];
		contactData.forEach((contactData) => {
			const newContact = new Contact(contactData);
			contacts.push(newContact);
		});
		return contacts;
	}

	/**
	 * Sorts an array of contacts alphabetically by first name.
	 * @param {Contact[]} contacts - The array of contacts to sort.
	 * @returns {Contact[]} - The sorted array of contacts.
	 */
	sortContacts(contacts: Contact[]): Contact[] {
		return contacts.sort((a, b) => a.first_name.localeCompare(b.first_name));
	}

	// String Manipulation

	/**
	 * Separates a full name into first and last names.
	 * @param {string} name - The full name to separate.
	 * @returns {string[]} - An array containing the first name and last name.
	 */
	separateUserName(name: string): string[] {
		const firstNamePattern = /^[\u00C0-\u017Fa-zA-Z-']+(?=\s{1}[\u00C0-\u017Fa-zA-Z-']+)/gu;
		const lastNamePattern = /(?<=[\u00C0-\u017Fa-zA-Z-']+\s{1})([\u00C0-\u017Fa-zA-Z-']+\s?)+/gu;
		const first_name = name.match(firstNamePattern);
		const last_name = name.match(lastNamePattern);
		return [first_name![0], last_name![0]];
	}

	/**
	 * Capitalizes the first letter of a string.
	 * @param {string} string - The string to capitalize.
	 * @returns {string} - The capitalized string.
	 */
	capitalize(string: string): string {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Overlay

	/**
	 * Hides the overlay component and optionally clears the data signal.
	 * @param {boolean} [clearData] - Whether to clear the data signal.
	 */
	hideOverlay(clearData?: boolean): void {
		this.component = undefined;
		if (clearData) this.dataSig.set(undefined);
	}
}
