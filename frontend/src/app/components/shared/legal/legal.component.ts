import { Component, inject } from '@angular/core';
import { UtilityService } from '../../../services/utitily/utility.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-legal',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './legal.component.html',
	styleUrl: './legal.component.scss',
})
export class LegalComponent {
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
}
