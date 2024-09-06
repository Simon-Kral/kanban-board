import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-pre-login-page',
	standalone: true,
	imports: [HeaderComponent, RouterOutlet, FooterComponent],
	templateUrl: './pre-login-page.component.html',
	styleUrl: './pre-login-page.component.scss',
})
export class PreLoginPageComponent {}
