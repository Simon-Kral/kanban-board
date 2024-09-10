import { JsonPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, JsonPipe, NgClass],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent {
	authService = inject(AuthService);
	router = inject(Router);
	passwordType: string = 'password';
	passwordIcon: string = 'assets/img/lock.svg';
	fb = inject(NonNullableFormBuilder);

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
		rememberMe: [false],
	});

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
		console.log('submitted form', this.loginForm.value, this.loginForm.invalid);
		this.authService.loginWithEmailAndPassword(this.loginForm.controls.email.value, this.loginForm.controls.password.value).subscribe({
			next: (resp) => {
				console.log(resp);
				localStorage.setItem('token', resp.token);
				this.router.navigateByUrl('/home');
			},
		});
		this.loginForm.reset();
	}
}
