import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
	selector: 'app-pre-header',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './pre-header.component.html',
	styleUrl: './pre-header.component.scss',
})
export class PreHeaderComponent {
	router = inject(Router);
}
