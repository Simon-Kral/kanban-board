import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { Task } from '../../../models/task.class';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
	cdr = inject(ChangeDetectorRef);
	dbService = inject(DbService);
	authService = inject(AuthService);

	mostUrgentDate: string = 'January 01, 1970';
	cards = [
		{ name: 'todo', amount: 0, description: 'To-Do' },
		{ name: 'done', amount: 0, description: 'Done' },
		{ name: 'urgent', amount: 0, description: 'Urgent' },
		{ name: 'board', amount: 0, description: 'Tasks in Board' },
		{ name: 'progress', amount: 0, description: 'Tasks In Progress' },
		{ name: 'feedback', amount: 0, description: 'Awaiting Feedback' },
	];
	cardsSig = signal<any[] | null>(this.cards);
	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	async ngOnInit() {
		this.getTasks();
	}

	getTasks() {
		this.dbService.getTasks().subscribe({
			next: (tasks) => {
				this.setCards(tasks as Task[]);
				this.cdr.markForCheck();
			},
		});
	}

	setCards(tasks: Task[]) {
		this.getCardByName('todo').amount = this.countInTasks(tasks, 'status', 'todo');
		this.getCardByName('done').amount = this.countInTasks(tasks, 'status', 'done');
		this.getCardByName('urgent').amount = this.countInTasks(tasks, 'prio', 3);
		this.mostUrgentDate = this.getMostUrgentDate(tasks);
		this.getCardByName('board').amount = tasks.length;
		this.getCardByName('progress').amount = this.countInTasks(tasks, 'status', 'inProgress');
		this.getCardByName('feedback').amount = this.countInTasks(tasks, 'status', 'awaitFeedback');
		this.cardsSig.set(this.cards);
	}

	getCardByName(name: string) {
		return this.cards.find((element) => element.name === name)!;
	}

	getMostUrgentDate(tasks: Task[]) {
		const task = this.getMostUrgentTask(tasks);
		return this.formatDate(task.due_date);
	}

	getMostUrgentTask(tasks: Task[]) {
		const urgentTasks: Task[] = [];
		tasks.forEach((task) => {
			task.prio === 3 && task.status != 'done' ? urgentTasks.push(task) : '';
		});
		urgentTasks.sort((a, b) => {
			var aa = a.due_date.replace('-', ''),
				bb = b.due_date.replace('-', '');
			return aa < bb ? -1 : aa > bb ? 1 : 0;
		});
		return urgentTasks[0];
	}

	formatDate(date: string) {
		let [year, month, day] = date.split('-');
		return `${this.months[Number(month) - 1]} ${day}, ${year}`;
	}

	countInTasks(tasks: Task[], key: string, value: any) {
		let counter = 0;
		tasks.forEach((task) => {
			if (task[key as keyof Task] === value) {
				key != 'prio' ? counter++ : task.status != 'done' ? counter++ : '';
			}
		});
		return counter;
	}
}
