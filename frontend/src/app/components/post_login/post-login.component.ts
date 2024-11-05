import { Component, inject } from '@angular/core';
import { PostHeaderComponent } from './post-header/post-header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { UtilityService } from '../../services/utitily/utility.service';
import { NgComponentOutlet } from '@angular/common';

@Component({
	selector: 'app-post-login',
	standalone: true,
	imports: [PostHeaderComponent, SidebarComponent, RouterOutlet, NgComponentOutlet],
	templateUrl: './post-login.component.html',
	styleUrl: './post-login.component.scss',
})
export class PostLoginComponent {
	utilityService = inject(UtilityService);

	/**
	 * Closes any open user-related menus by setting the `userMenu` flag in the utility service to false.
	 */
	closeMenus(): void {
		this.utilityService.userMenu = false;
	}
}
