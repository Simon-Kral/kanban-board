import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Task } from '../../interfaces/task';
import { Subtask } from '../../interfaces/subtask';
import { AuthService } from '../auth/auth.service';
import { UtilityService } from '../utitily/utility.service';
import { Contact } from '../../models/contact.class';

@Injectable({
	providedIn: 'root',
})
export class DbService {
	http = inject(HttpClient);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);

	contactsSig = signal<Contact[]>([]);
	tasksSig = signal<Task[]>([]);
	subtasksSig = signal<Subtask[]>([]);
	searchValueSig = signal<string>('');
	visibleTasksSig = computed(() => {
		return this.tasksSig().filter((task) => this.taskIncludesSearchValue(task));
	});
	summaryDataSig = signal<any[]>([
		{ name: 'todo', amount: 0, description: 'To-Do' },
		{ name: 'done', amount: 0, description: 'Done' },
		{ name: 'urgent', amount: 0, description: 'Urgent', date: 'January 01, 1970' },
		{ name: 'board', amount: 0, description: 'Tasks in Board' },
		{ name: 'progress', amount: 0, description: 'Tasks In Progress' },
		{ name: 'feedback', amount: 0, description: 'Awaiting Feedback' },
	]);

	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	constructor() {}

	setSummarySigData() {
		const data = [
			{ name: 'todo', amount: this.countInTasks('status', 'todo'), description: 'To-Do' },
			{ name: 'done', amount: this.countInTasks('status', 'done'), description: 'Done' },
			{ name: 'urgent', amount: this.countInTasks('prio', 1), description: 'Urgent', date: this.getMostUrgentDate() },
			{ name: 'board', amount: this.tasksSig().length, description: 'Tasks in Board' },
			{ name: 'progress', amount: this.countInTasks('status', 'inProgress'), description: 'Tasks In Progress' },
			{ name: 'feedback', amount: this.countInTasks('status', 'awaitFeedback'), description: 'Awaiting Feedback' },
		];
		this.summaryDataSig.set(data);
	}

	getMostUrgentDate() {
		const task = this.getMostUrgentTask();
		return this.formatDate(task.due_date);
	}

	getMostUrgentTask() {
		const urgentTasks: Task[] = [];
		this.tasksSig().forEach((task) => {
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

	countInTasks(key: keyof Task, value: any) {
		let counter = 0;
		this.tasksSig().forEach((task) => {
			if (task[key] === value) {
				key != 'prio' ? counter++ : task.status != 'done' ? counter++ : '';
			}
		});
		return counter;
	}

	taskIncludesSearchValue(task: Task): boolean {
		return task.title.toLowerCase().includes(this.searchValueSig()!.toLowerCase()) || task.description.toLowerCase().includes(this.searchValueSig()!.toLowerCase());
	}

	getContactsData(): Observable<Contact[]> {
		const url = environment.baseUrl + '/contacts/';
		return this.http.get(url) as Observable<Contact[]>;
	}

	getTasksData(): Observable<Task[]> {
		const url = environment.baseUrl + '/tasks/';
		return this.http.get(url) as Observable<Task[]>;
	}

	getSubtasksData(): Observable<Subtask[]> {
		const url = environment.baseUrl + '/subtasks/';
		return this.http.get(url) as Observable<Subtask[]>;
	}

	addTask(formData: any): Observable<Task> {
		const url = environment.baseUrl + '/tasks/';
		let assignedToContacts: number[] = [];
		formData.assignedTo.forEach((contact: Contact) => {
			assignedToContacts.push(contact.id);
		});
		const body = {
			author: 1,
			title: formData.title,
			description: formData.description,
			assigned_to: assignedToContacts,
			due_date: formData.dueDate.split('/').reverse().join('-'),
			prio: formData.prio,
			category: formData.category,
			subtasks: formData.subtasks,
			status: this.utilityService.taskStatus,
		};
		return this.http.post(url, body) as Observable<Task>;
	}

	updateTask(taskId: number, newValue: Partial<Task>): Observable<Task> {
		const url = environment.baseUrl + '/tasks/' + taskId + '/';
		const body = newValue;
		return this.http.patch(url, body) as Observable<Task>;
	}

	getContactParameterById(uid: number, key: keyof Contact): string | number {
		return this.contactsSig()!.find((contact) => contact.id === uid)![key];
	}

	getPrioStringFromNumber(prio: number): string {
		const map = new Map([
			[1, 'urgent'],
			[2, 'medium'],
			[3, 'low'],
		]);
		return map.get(prio)!;
	}

	getFinishedSubtasks(taskId: number): number {
		return this.subtasksSig().filter((subtask) => subtask.task === taskId && subtask.done).length;
	}

	getSubtaskAmount(taskId: number): number {
		return this.subtasksSig().filter((subtask) => subtask.task === taskId).length;
	}

	getCategoryStyle(category: string): { 'background-color': string } {
		if (category === 'Technical Task') {
			return { 'background-color': '#1FD7C1' };
		} else if (category === 'User Story') {
			return { 'background-color': '#0038FF' };
		} else {
			return { 'background-color': 'black' };
		}
	}
}
