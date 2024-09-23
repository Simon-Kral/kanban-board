import { Component, inject } from '@angular/core';
import { PostHeaderComponent } from '../post-header/post-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { UtilityService } from '../../../services/utitily/utility.service';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'app-pre-login-page',
	standalone: true,
	imports: [PostHeaderComponent, SidebarComponent, RouterOutlet, NgComponentOutlet],
	templateUrl: './post-login-page.component.html',
	styleUrl: './post-login-page.component.scss',
})
export class PostLoginPageComponent {
	utilityService = inject(UtilityService);

	constructor() {}

	onclick(event: Event) {
		event.stopPropagation();
	}
}
