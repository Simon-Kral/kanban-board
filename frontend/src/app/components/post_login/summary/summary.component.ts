import { Component, inject, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { RouterLink } from '@angular/router';
import { SummaryInterface } from '../../../interfaces/summary';
import { UtilityService } from '../../../services/utitily/utility.service';

@Component({
	selector: 'app-summary',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './summary.component.html',
	styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	cards = [
		{ name: 'todo', amount: 0, description: 'To-Do', data: 'todo' },
		{ name: 'done', amount: 0, description: 'Done', data: 'done' },
		{ name: 'urgent', amount: 0, description: 'Urgent', date: 'January 01, 1970', data: 'urgent' },
		{ name: 'board', amount: 0, description: 'Tasks in Board', data: 'allTasks' },
		{ name: 'inProgress', amount: 0, description: 'Tasks In Progress', data: 'in_progress' },
		{ name: 'awaitFeedback', amount: 0, description: 'Awaiting Feedback', data: 'await_feedback' },
	];

	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	/**
	 * Initializes the component, resets backend errors, and fetches summary data.
	 * Sets the loading state while retrieving the data and handles any potential errors.
	 */
	async ngOnInit(): Promise<void> {
		this.dbService.resetBackendErrors();
		this.utilityService.loading = true;
		try {
			let resp = await this.dbService.getSummaryData();
			this.setCards(resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	// Cards

	/**
	 * Updates the card amounts based on the provided summary data.
	 * For the 'urgent' card, it also formats the most urgent date.
	 *
	 * @param {SummaryInterface} data - The summary data containing counts for the cards.
	 */
	setCards(data: SummaryInterface): void {
		for (let card of this.cards) {
			const key = card.data as keyof SummaryInterface;
			card.amount = data[key].count;
			if (card.name === 'urgent') {
				card.date = this.formatDate(data.urgent.most_urgent_date);
			}
		}
	}

	/**
	 * Formats a date string from 'YYYY-MM-DD' to 'Month DD, YYYY'.
	 *
	 * @param {string} date - The date string to format.
	 * @returns {string} The formatted date.
	 */
	formatDate(date: string): string {
		let [year, month, day] = date.split('-');
		return `${this.months[Number(month) - 1]} ${day}, ${year}`;
	}

	// Greeting

	/**
	 * Returns a time-based greeting based on the current hour.
	 *
	 * @returns {string} A greeting message: 'Good morning', 'Good afternoon', or 'Good evening'.
	 */
	getTimeBasedGreeting(): string {
		let hour = new Date().getHours();
		let greeting = '';
		hour > 18 || hour < 6 ? (greeting = 'Good evening') : hour > 12 ? (greeting = 'Good afternoon') : (greeting = 'Good morning');
		return greeting;
	}
}
