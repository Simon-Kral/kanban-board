import { Component, inject } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Contact } from '../../../models/contact.class';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AddContactComponent } from '../add-contact/add-contact.component';
import { EditContactComponent } from '../edit-contact/edit-contact.component';

@Component({
	selector: 'app-contacts',
	standalone: true,
	imports: [],
	templateUrl: './contacts.component.html',
	styleUrl: './contacts.component.scss',
})
export class ContactsComponent {
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
	dbService = inject(DbService);

	separatorIsNeeded(index: number): boolean {
		if (this.newCharacter(index)) {
			return true;
		} else {
			return false;
		}
	}

	newCharacter(index: number): boolean {
		const contacts = this.dbService.contactsSig();
		return !contacts[index - 1] || contacts[index].first_name[0] != contacts[index - 1].first_name[0];
	}

	selectContact(contact: Contact) {
		this.utilityService.selectedContactSig.set(contact);
	}

	openAddContact(): void {
		this.utilityService.embeddedComponentSig.set(AddContactComponent);
		this.utilityService.overlaySig.set(true);
	}
	openEditContact(): void {
		this.utilityService.embeddedComponentSig.set(EditContactComponent);
		this.utilityService.overlaySig.set(true);
	}
}
