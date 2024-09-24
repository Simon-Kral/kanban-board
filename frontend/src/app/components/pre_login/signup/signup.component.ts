import { JsonPipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

export const passwordsMatchValidator = (password: AbstractControl): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		return password.value != control.value ? { passwordsMatch: 'The Passwords must match.' } : null;
	};
};

export const nameIsFullNameValidator = (control: AbstractControl): ValidationErrors | null => {
	const pattern = /[\w]+(\s{1}[\w]+)+/;
	return !pattern.test(control.value) ? { nameIsFullName: 'Please enter your full name.' } : null;
};

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, NgClass, RouterLink],
	templateUrl: './signup.component.html',
	styleUrl: './signup.component.scss',
})
export class SignupComponent {
	authService = inject(AuthService);
	router = inject(Router);
	passwordType: string = 'password';
	passwordIcon: string = 'assets/img/lock.svg';
	backendErrors: string[] = [];
	backendErrorsSig = signal<string[] | null | undefined>(undefined);
	fb = inject(NonNullableFormBuilder);

	signupForm = this.fb.group({
		name: ['', [Validators.required, nameIsFullNameValidator]],
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
		confirmPassword: ['', [Validators.required]],
		privacy: [false, [Validators.requiredTrue]],
	});

	constructor() {
		this.signupForm.controls.confirmPassword.addValidators(passwordsMatchValidator(this.signupForm.get('password')!));
	}

	handlePasswordMasking(): void {
		if (this.passwordType === 'password') {
			this.passwordType = 'text';
			this.passwordIcon = 'assets/img/visibility.svg';
		} else {
			this.passwordType = 'password';
			this.passwordIcon = 'assets/img/visibility_off.svg';
		}
	}

	handlePasswordFieldFocus() {
		if (this.passwordIcon === 'assets/img/lock.svg') {
			this.passwordIcon = 'assets/img/visibility_off.svg';
		}
	}

	formInvalid(formControl: FormControl<string | boolean>) {
		return formControl.invalid && (formControl.touched || formControl.dirty);
	}

	resetBackendErrors() {
		this.backendErrors = [];
		this.backendErrorsSig.set(undefined);
	}

	onSubmit() {
		const user = this.signupForm.value;
		this.authService.signup(user).subscribe({
			next: (resp) => {
				if (resp.token && resp.user) {
					localStorage.setItem('token', resp.token);
					this.router.navigateByUrl('/home');
					this.signupForm.reset();
				} else {
					this.loadBackendErrors(resp);
				}
			},
		});
	}

	loadBackendErrors(resp: any) {
		this.backendErrors = [];
		for (const key in resp) {
			const errors = resp[key];
			for (let i = 0; i < errors.length; i++) {
				const error = errors[i];
				this.backendErrors.push(error);
			}
		}
		this.backendErrorsSig.set(this.backendErrors);
	}
}
