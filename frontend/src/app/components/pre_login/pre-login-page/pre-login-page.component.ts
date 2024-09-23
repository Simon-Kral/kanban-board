import { Component } from '@angular/core';
import { PreHeaderComponent } from '../pre-header/pre-header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-pre-login-page',
	standalone: true,
	imports: [PreHeaderComponent, RouterOutlet, FooterComponent],
	templateUrl: './pre-login-page.component.html',
	styleUrl: './pre-login-page.component.scss',
})
export class PreLoginPageComponent {}
