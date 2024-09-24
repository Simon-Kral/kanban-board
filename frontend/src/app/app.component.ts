import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { DbService } from './services/db/db.service';
import { Router } from '@angular/router';
import { Contact } from './models/contact.class';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	title = 'frontend';

	cdr = inject(ChangeDetectorRef);

	authService = inject(AuthService);
	dbService = inject(DbService);
	router = inject(Router);

	colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

	ngOnInit(): void {
		this.getCurrentUser();
		this.getTasks();
		this.getSubtasks();
		this.getContacts();
	}

	getCurrentUser() {
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				if (user) {
					this.authService.currentUserSig.set(user);
					console.log('authUser:', this.authService.currentUserSig());
					if (!this.router.url.includes('/home')) {
						this.router.navigateByUrl('/home');
					}
				} else {
					this.router.navigateByUrl('');
				}
			},
		});
	}

	getTasks(): void {
		this.dbService.getTasksData().subscribe({
			next: (tasks) => {
				this.dbService.tasksSig.set(tasks);
				this.dbService.setSummarySigData();
			},
		});
	}

	getSubtasks(): void {
		this.dbService.getSubtasksData().subscribe({
			next: (subtasks) => {
				this.dbService.subtasksSig.set(subtasks);
			},
		});
	}

	getContacts(): void {
		this.dbService.getContactsData().subscribe({
			next: (contacts) => {
				this.dbService.contactsSig.set([]);
				let contactList: Contact[] = [];
				contacts.forEach((contactData) => {
					const newContact = new Contact(contactData);
					contactList.push(newContact);
				});
				this.dbService.contactsSig.set(contactList.sort((a, b) => a.first_name.localeCompare(b.first_name)));
			},
		});
	}
}
