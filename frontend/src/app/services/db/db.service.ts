import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { lastValueFrom, Observable } from 'rxjs';
import { User } from '../../models/user.class';

@Injectable({
	providedIn: 'root',
})
export class DbService {
	http = inject(HttpClient);

	constructor() {}

	getTasks() {
		const url = environment.baseUrl + '/tasks/';
		return this.http.get(url);
	}

	getContacts() {
		const url = environment.baseUrl + '/contacts/';
		return this.http.get(url) as Observable<Object[]>;
	}

	addTask(formData: any) {
		const url = environment.baseUrl + '/tasks/';
		let assignedToUsers: number[] = [];
		formData.assignedTo.forEach((user: User) => {
			assignedToUsers.push(user.id!);
		});
		const body = {
			title: formData.title,
			description: formData.description,
			assigned_to: assignedToUsers,
			due_date: formData.dueDate.split('/').reverse().join('-'),
			prio: formData.prio,
			category: formData.category,
			subtasks: formData.subtasks,
		};
		return this.http.post(url, body) as Observable<any>;
	}
}
