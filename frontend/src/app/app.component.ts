import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { UtilityService } from './services/utitily/utility.service';
import { filter } from 'rxjs';
import { DbService } from './services/db/db.service';
import { ContactInterface } from './interfaces/contact';
import { TaskInterface } from './interfaces/task';
import { UserInterface } from './interfaces/user';
import { NgStyle } from '@angular/common';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, NgStyle],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	title = 'frontend';

	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	router = inject(Router);
	navEndEvent = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

	constructor() {
		this.navEndEvent.subscribe((event) => {
			const currentUrl = event.url;
			const token = this.getToken();
			const user = this.authService.currentUserSig();
			if (token) {
				this.handlePostLoginSection(currentUrl, user);
			} else {
				this.handlePreLoginSection(currentUrl);
			}
			this.utilityService.hideOverlay(true);
			this.utilityService.userMenu = false;
		});
		this.checkViewport();
	}

	/**
	 * Handles the window resize event and updates the viewport check.
	 * @param {Event} [event] - The resize event.
	 */
	@HostListener('window:resize', ['$event'])
	getScreenSize(event?: Event) {
		this.checkViewport();
	}

	// Section Handlers

	/**
	 * Handles routing and data retrieval for post-login sections.
	 * @param {string} currentUrl - The current URL of the application.
	 * @param {UserInterface | null | undefined} user - The current user object or null.
	 * @returns {Promise<void>}
	 */
	async handlePostLoginSection(currentUrl: string, user: UserInterface | null | undefined): Promise<void> {
		if (!this.inPostLogin(currentUrl)) {
			this.router.navigateByUrl('/home');
		}
		if (!user) {
			await this.getUser();
		}
		if (this.dataSignalsEmpty()) {
			await this.getData();
		}
	}

	/**
	 * Handles routing logic for pre-login sections.
	 * @param {string} currentUrl - The current URL of the application.
	 */
	handlePreLoginSection(currentUrl: string): void {
		if (currentUrl.includes('/home') && !this.inLegals(currentUrl)) {
			this.router.navigateByUrl('/login');
		}
	}

	// Data

	/**
	 * Retrieves the authentication token from local or session storage.
	 * @returns {string | null} - The token if present, otherwise null.
	 */
	getToken(): string | null {
		return localStorage.getItem('token') ? localStorage.getItem('token') : sessionStorage.getItem('token');
	}

	/**
	 * Fetches the current user data from the AuthService and updates the user signal.
	 * @returns {Promise<void>}
	 */
	async getUser(): Promise<void> {
		this.utilityService.loading = true;
		let resp = await this.authService.getUser();
		this.authService.currentUserSig.set(resp.user);
		this.utilityService.loading = false;
	}

	/**
	 * Fetches contact and task data from the database service and updates the signals.
	 * @returns {Promise<void>}
	 */
	async getData(): Promise<void> {
		this.utilityService.loading = true;
		let contactData = await this.dbService.getContactsData();
		let tasks = await this.dbService.getTasksData();
		this.setContactsSignal(contactData);
		this.setTasksSignal(tasks);
		this.utilityService.loading = false;
	}

	/**
	 * Updates the contacts signal with sorted contact data.
	 * @param {ContactInterface[]} contactData - Array of contact data to set.
	 */
	setContactsSignal(contactData: ContactInterface[]): void {
		const contacts = this.utilityService.createContacts(contactData);
		this.dbService.contactsSig.set(this.utilityService.sortContacts(contacts));
	}

	/**
	 * Updates the tasks signal with task data.
	 * @param {TaskInterface[]} tasks - Array of task data to set.
	 */
	setTasksSignal(tasks: TaskInterface[]): void {
		this.dbService.tasksSig.set(tasks);
	}

	// Routing Conditions

	/**
	 * Checks if the URL is within legal pages (privacy or legal notice).
	 * @param {string} url - The URL to check.
	 * @returns {boolean} - True if URL is within legal pages, otherwise false.
	 */
	inLegals(url: string): boolean {
		return url === '/home/legal' || url === '/home/privacy';
	}

	/**
	 * Checks if the URL is within post-login sections.
	 * @param {string} url - The URL to check.
	 * @returns {boolean} - True if URL is within post-login sections, otherwise false.
	 */
	inPostLogin(url: string): boolean {
		return url.includes('/home');
	}

	/**
	 * Checks if the contact and task signals are empty.
	 * @returns {boolean} - True if both signals are empty, otherwise false.
	 */
	dataSignalsEmpty(): boolean {
		const contacts = this.dbService.contactsSig();
		const tasks = this.dbService.tasksSig();
		return !(contacts.length > 0) && !(tasks.length > 0);
	}

	// Responsive

	/**
	 * Checks the viewport dimensions to adjust layout based on screen size.
	 */
	checkViewport(): void {
		const innerWidth = window.innerWidth;
		const innerHeight = window.innerHeight;
		this.utilityService.smallScreenView = innerWidth <= 1024;
	}
}
