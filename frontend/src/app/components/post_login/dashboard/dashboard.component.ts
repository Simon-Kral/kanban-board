import { Component } from '@angular/core';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	cards = [
		{ name: 'todo', amount: 1, description: 'To-Do' },
		{ name: 'done', amount: 1, description: 'Done' },
		{ name: 'urgent', amount: 1, description: 'Urgent' },
		{ name: 'board', amount: 5, description: 'Tasks in Board' },
		{ name: 'progress', amount: 2, description: 'Tasks In Progress' },
		{ name: 'feedback', amount: 2, description: 'Awaiting Feedback' },
	];
}
