import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { User } from './models/user.class';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	title = 'frontend';
	authService = inject(AuthService);

	ngOnInit(): void {
		this.getCurrentUser();
	}

	getCurrentUser() {
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				console.log('authUser:', user);
				const currentUser = new User(user);
				this.authService.currentUserSig.set({
					email: currentUser.email,
					first_name: currentUser.first_name,
					last_name: currentUser.last_name,
					initials: currentUser.initials,
					color: currentUser.color,
				});
			},
		});
	}
}
