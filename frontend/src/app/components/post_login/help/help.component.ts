import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UtilityService } from '../../../services/utitily/utility.service';

@Component({
	selector: 'app-help',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './help.component.html',
	styleUrl: './help.component.scss',
})
export class HelpComponent {
	utilityService = inject(UtilityService);
}
