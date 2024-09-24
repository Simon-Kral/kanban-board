import { Injectable, signal } from '@angular/core';
import { AddTaskComponent } from '../../components/post_login/add-task/add-task.component';
import { Contact } from '../../models/contact.class';

@Injectable({
	providedIn: 'root',
})
export class UtilityService {
	overlaySig = signal<Boolean>(false);
	embeddedComponentSig = signal<any | undefined>(undefined);
	selectedContactSig = signal<Contact | undefined>(undefined);
	taskStatus: string = 'todo';

	constructor() {}
}
