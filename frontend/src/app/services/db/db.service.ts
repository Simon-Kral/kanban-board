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

	getUsers() {
		const url = environment.baseUrl + '/users/';
		return this.http.get(url) as Observable<User[]>;
	}
}
