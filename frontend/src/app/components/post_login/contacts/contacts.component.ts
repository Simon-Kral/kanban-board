import { Component, inject, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Contact } from '../../../models/contact.class';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AddContactComponent } from '../embedded/add-contact/add-contact.component';
import { EditContactComponent } from '../embedded/edit-contact/edit-contact.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
	selector: 'app-contacts',
	standalone: true,
	imports: [NgClass, NgStyle],
	templateUrl: './contacts.component.html',
	styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
	dbService = inject(DbService);

	/**
	 * Initializes the component by resetting backend errors and setting initial states
	 * for the utility service's properties related to contact details and sidebar visibility.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
		this.utilityService.contactsDetailsActive = false;
		this.utilityService.contactsSidebarActive = true;
		this.utilityService.contactOptionsMenu = false;
	}

	// Contact List

	/**
	 * Determines whether a separator is needed between contacts based on their initials.
	 * @param index - The index of the contact in the contact list.
	 * @returns True if a separator is needed; otherwise, false.
	 */
	separatorIsNeeded(index: number): boolean {
		return this.isNewCharacter(index);
	}

	/**
	 * Checks if the current contact is the first contact with a new initial.
	 * @param index - The index of the contact in the contact list.
	 * @returns True if the current contact's first name starts with a new initial; otherwise, false.
	 */
	isNewCharacter(index: number): boolean {
		const contacts = this.dbService.contactsSig();
		return !contacts[index - 1] || contacts[index].first_name[0] !== contacts[index - 1].first_name[0];
	}

	// Contact Details

	/**
	 * Opens the Add Contact component to allow the user to add a new contact.
	 */
	openAddContact(): void {
		this.utilityService.component = AddContactComponent;
	}

	/**
	 * Opens the details for the specified contact and updates the utility service
	 * to show the contact details while hiding the sidebar.
	 * @param contact - The contact object to display.
	 */
	openContact(contact: Contact): void {
		this.utilityService.dataSig.set(contact);
		this.utilityService.contactsDetailsActive = true;
		this.utilityService.contactsSidebarActive = false;
	}

	/**
	 * Closes the currently opened contact details and reverts the sidebar to be visible.
	 */
	closeContact(): void {
		this.utilityService.dataSig.set(undefined);
		this.utilityService.contactsDetailsActive = false;
		this.utilityService.contactsSidebarActive = true;
	}

	/**
	 * Opens the Edit Contact component for modifying the currently selected contact.
	 */
	openEditContact(): void {
		this.utilityService.component = EditContactComponent;
		this.utilityService.contactOptionsMenu = false;
	}

	/**
	 * Deletes the currently selected contact by its ID, showing a loading indicator
	 * during the process and handling any potential backend errors.
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
	 * Completes the contact deletion process by removing the contact from the signal
	 * and hiding the overlay while resetting the contact options menu.
	 * @param id - The ID of the contact that was deleted.
	 */
	completeContactDelete(id: number): void {
		this.utilityService.removeFromSignal(this.dbService.contactsSig, id);
		this.utilityService.hideOverlay(true);
		this.utilityService.contactOptionsMenu = false;
	}

	// Overlay

	/**
	 * Toggles the visibility of the contact options menu.
	 */
	toggleOptionsMenu(): void {
		this.utilityService.contactOptionsMenu = !this.utilityService.contactOptionsMenu;
	}

	/**
	 * Closes the contact options menu if it is open.
	 */
	closeOptionsMenu(): void {
		this.utilityService.contactOptionsMenu = false;
	}
}
