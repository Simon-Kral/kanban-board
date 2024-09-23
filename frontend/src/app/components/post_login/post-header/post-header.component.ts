import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-post-header',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './post-header.component.html',
	styleUrl: './post-header.component.scss',
})
export class PostHeaderComponent {
	authService = inject(AuthService);
}
