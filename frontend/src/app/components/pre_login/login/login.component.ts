import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { UserInterface } from '../../../interfaces/user';
import { GuestService } from '../../../services/guest/guest.service';
import { DbService } from '../../../services/db/db.service';
import { UtilityService } from '../../../services/utitily/utility.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass, RouterLink],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
	router = inject(Router);
	authService = inject(AuthService);
	dbService = inject(DbService);
	guestService = inject(GuestService);
	utilityService = inject(UtilityService);

	fb = inject(NonNullableFormBuilder);

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
		rememberMe: [false],
	});

	/**
	 * Initializes the login component by resetting any backend errors stored in the database service.
	 * This ensures a clean start each time the login component is loaded.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Form

	/**
	 * Submits the login form data. Displays a loading indicator during processing,
	 * attempts to authenticate the user, and captures any backend errors encountered.
	 * @returns {Promise<void>} A promise that resolves once the submission and error handling are complete.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		try {
			await this.loginUser();
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	/**
	 * Authenticates the user using email and password from the login form.
	 * Stores the authentication token in either local or session storage based on the "Remember Me" selection.
	 * Navigates the user to the home page upon successful login.
	 * @returns {Promise<void>} A promise that resolves after the login process completes.
	 */
	async loginUser(): Promise<void> {
		let loginData = this.createloginData();
		let rememberMe = this.loginForm.controls.rememberMe.value;
		let resp: { token: string; user: Object } = await this.authService.loginWithEmailAndPassword(loginData);
		rememberMe ? localStorage.setItem('token', resp.token) : sessionStorage.setItem('token', resp.token);
		this.authService.currentUserSig.set(resp.user as UserInterface);
		this.loginForm.reset();
		this.router.navigateByUrl('home');
	}

	// Guest User

	/**
	 * Logs in a guest user by either authenticating an existing guest account or creating a new one.
	 * Redirects the guest user to the home page upon success and manages any backend errors that occur.
	 * @returns {Promise<void>} A promise that resolves when the guest login or creation is complete.
	 */
	async loginGuest(): Promise<void> {
		this.utilityService.loading = true;
		try {
			let guest = await this.guestService.getGuest();
			guest.exists ? await this.guestService.loginGuest() : await this.guestService.createGuest();
			this.router.navigateByUrl('home');
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	// Data

	/**
	 * Creates a login data object by retrieving the email and password values from the login form.
	 * @returns {{ email: string; password: string }} An object containing the email and password values.
	 */
	createloginData(): { email: string; password: string } {
		const rawData = this.loginForm.getRawValue();
		return { email: rawData.email, password: rawData.password };
	}
}
