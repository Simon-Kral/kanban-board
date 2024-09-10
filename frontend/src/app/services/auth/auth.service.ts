import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { lastValueFrom, Observable } from 'rxjs';
import { User } from '../../models/user.class';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	http = inject(HttpClient);
	currentUserSig = signal<User | null | undefined>(undefined);

	constructor() {}

	signup(user: User) {
		const url = environment.baseUrl + '/signup/';
		const body = user;
		return this.http.post(url, body) as Observable<{ token: string; user: Object }>;
	}

	loginWithEmailAndPassword(email: string, password: string) {
		const url = environment.baseUrl + '/login/';
		const body = {
			email: email,
			password: password,
		};
		return this.http.post(url, body) as Observable<{ token: string; user: Object }>;
	}

	getCurrentUser(): Observable<User> {
		const url = environment.baseUrl + '/user/';
		return this.http.get(url) as Observable<User>;
	}
}
