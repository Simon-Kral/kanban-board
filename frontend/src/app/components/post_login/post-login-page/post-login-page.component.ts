import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-pre-login-page',
	standalone: true,
	imports: [HeaderComponent, SidebarComponent, RouterOutlet],
	templateUrl: './post-login-page.component.html',
	styleUrl: './post-login-page.component.scss',
})
export class PostLoginPageComponent {}
