import { Component } from '@angular/core';
import { PreHeaderComponent } from './pre-header/pre-header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-pre-login',
	standalone: true,
	imports: [PreHeaderComponent, RouterOutlet, FooterComponent],
	templateUrl: './pre-login.component.html',
	styleUrl: './pre-login.component.scss',
})
export class PreLoginComponent {}
