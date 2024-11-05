import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UtilityService } from '../../../services/utitily/utility.service';
import { NgStyle } from '@angular/common';

@Component({
	selector: 'app-post-header',
	standalone: true,
	imports: [RouterLink, NgStyle],
	templateUrl: './post-header.component.html',
	styleUrl: './post-header.component.scss',
})
export class PostHeaderComponent {
	authService = inject(AuthService);
	utilityService = inject(UtilityService);

	router = inject(Router);

	constructor() {}

	/**
	 * Toggles the visibility of the user menu.
	 * If the user menu is currently visible, it will be hidden,
	 * and if it is hidden, it will be displayed.
	 */
	toggleUserMenu(): void {
		this.utilityService.userMenu = !this.utilityService.userMenu;
	}
}
