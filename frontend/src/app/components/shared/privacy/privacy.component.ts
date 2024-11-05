import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-privacy',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './privacy.component.html',
	styleUrl: './privacy.component.scss',
})
export class PrivacyComponent {
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
}
