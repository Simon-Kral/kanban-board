import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { first } from 'rxjs';
import { UtilityService } from '../../../services/utitily/utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DbService } from '../../../services/db/db.service';
import { Contact } from '../../../models/contact.class';
import { UserInterface } from '../../../interfaces/user';

// Custom Validators

/**
 * Validator function to check if the password and confirmation password match.
 * @param {AbstractControl} password - The control representing the password.
 * @returns {ValidatorFn} A validator function that returns an error if passwords do not match, otherwise null.
 */
export const passwordsMatchValidator = (password: AbstractControl): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		return password.value != control.value ? { passwordsMatch: 'The Passwords must match.' } : null;
	};
};

/**
 * Validator function to check if the provided name is in full name format (first and last name).
 * @param {AbstractControl} control - The form control to validate.
 * @returns {ValidationErrors | null} An error if the name is not in full name format, otherwise null.
 */
export const nameIsFullNameValidator = (control: AbstractControl): ValidationErrors | null => {
	const pattern = /[\u00C0-\u017Fa-zA-Z']+(\s{1}[\u00C0-\u017Fa-zA-Z']+)+/gu;
	return !pattern.test(control.value) ? { nameIsFullName: 'Please enter your full name.' } : null;
};

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass, RouterLink],
	templateUrl: './signup.component.html',
	styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
	router = inject(Router);
	fb = inject(NonNullableFormBuilder);

	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
	color: string;

	signupForm = this.fb.group({
		name: ['', [Validators.required, nameIsFullNameValidator]],
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
		confirmPassword: ['', [Validators.required]],
		privacy: [false, [Validators.requiredTrue]],
	});

	/**
	 * Sets up the component by initializing form validators and a randomly selected color for the user profile.
	 */
	constructor() {
		this.signupForm.controls.confirmPassword.addValidators(passwordsMatchValidator(this.signupForm.get('password')!));
		this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
	}

	/**
	 * Initializes the component by resetting any backend errors in the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Form

	/**
	 * Handles form submission for user sign-up, showing a loading indicator, attempting to register the user,
	 * and handling any backend errors.
	 * @returns {Promise<void>} A promise that resolves once submission and error handling are complete.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		try {
			await this.signupUser();
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	/**
	 * Registers a new user based on the sign-up form data, adds the user as a contact, resets the form,
	 * and redirects to the login page with a success notification.
	 * @returns {Promise<void>} A promise that resolves once the user is signed up and added as a contact.
	 */
	async signupUser(): Promise<void> {
		let user = this.createUserObj();
		let resp: any = await this.authService.signup(user);
		await this.addUserAsContact(resp);
		this.signupForm.reset();
		this.router.navigateByUrl('');
		this.utilityService.notificateUser('You Signed Up successfully');
	}

	/**
	 * Adds the newly signed-up user as a contact in the database. Stores a temporary authentication token
	 * in session storage for authorization during the contact creation.
	 * @param {Object} resp - The response object containing the user's token and user data.
	 * @param {string} resp.token - The authentication token for the signed-up user.
	 * @param {UserInterface} resp.user - The user object containing user details.
	 * @returns {Promise<void>} A promise that resolves when the user is added as a contact.
	 */
	async addUserAsContact(resp: { token: string; user: UserInterface }): Promise<void> {
		sessionStorage.setItem('token', resp.token);
		const newContact = this.createContactObject(resp.user);
		await this.dbService.postContact(newContact);
		sessionStorage.clear();
	}

	// Data

	/**
	 * Creates a user object from the sign-up form data, separating the full name into first and last names.
	 * @returns {Object} An object containing the user's first name, last name, email, and password.
	 */
	createUserObj(): { first_name: string; last_name: string; email: string; password: string } {
		const rawData = this.signupForm.getRawValue();
		const [first_name, last_name] = this.utilityService.separateUserName(rawData.name);
		const user = {
			first_name: first_name,
			last_name: last_name,
			email: rawData.email,
			password: rawData.password,
		};
		return user;
	}

	/**
	 * Creates a Contact object for the user, using form data and a randomly assigned profile color.
	 * @param {UserInterface} user - The user object containing details like user ID.
	 * @returns {Contact} A new Contact instance with user details.
	 */
	createContactObject(user: UserInterface): Contact {
		const rawData = this.signupForm.getRawValue();
		const [first_name, last_name] = this.utilityService.separateUserName(rawData.name);
		const contact = new Contact(
			{
				first_name: first_name,
				last_name: last_name,
				email: rawData.email,
				phone: '',
				color: this.color,
			},
			user.id,
		);
		return contact;
	}
}
