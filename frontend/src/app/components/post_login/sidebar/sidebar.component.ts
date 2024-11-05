import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
	router = inject(Router);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
}
