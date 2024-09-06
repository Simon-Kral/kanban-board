import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { lastValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	http = inject(HttpClient);

	constructor() {}

	loginWithEmailAndPassword(email: string, password: string) {
		const url = environment.baseUrl + '/login/';
		const body = {
			email: email,
			password: password,
		};
		return lastValueFrom(this.http.post(url, body));
	}
}
