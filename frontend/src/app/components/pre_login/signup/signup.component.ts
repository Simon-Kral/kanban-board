import { JsonPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterLink } from '@angular/router';

export const passwordsMatchValidator = (password: AbstractControl): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		return password.value != control.value ? { passwordsMatch: 'The Passwords must match.' } : null;
	};
};

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, NgClass, RouterLink],
	templateUrl: './signup.component.html',
	styleUrl: './signup.component.scss',
})
export class SignupComponent {
	passwordType: string = 'password';
	passwordIcon: string = 'assets/img/lock.svg';
	fb = inject(NonNullableFormBuilder);

	signupForm = this.fb.group({
		name: ['', [Validators.required]],
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

	onSubmit() {
		console.log('submitted form', this.signupForm.value, this.signupForm.invalid);
		this.signupForm.reset();
	}
}
