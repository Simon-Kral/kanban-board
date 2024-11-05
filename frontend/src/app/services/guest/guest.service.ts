import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DbService } from '../db/db.service';
import { TaskInterface } from '../../interfaces/task';
import { ContactInterface } from '../../interfaces/contact';
import { SubtaskInterface } from '../../interfaces/subtask';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { UserInterface } from '../../interfaces/user';

@Injectable({
	providedIn: 'root',
})
export class GuestService {
	http = inject(HttpClient);
	authService = inject(AuthService);
	dbService = inject(DbService);

	contactIds: number[] = [];

	constructor() {}

	/**
	 * Retrieves guest data from the API.
	 * @returns {Promise<any>} Promise resolving to the guest data.
	 */
	getGuest(): Promise<any> {
		const url = environment.baseUrl + '/guest/';
		return lastValueFrom(this.http.get<any>(url));
	}

	/**
	 * Logs in a guest user with pre-defined credentials.
	 * @returns {Promise<void>} Promise that resolves when the login is complete.
	 */
	async loginGuest(): Promise<void> {
		let resp: any = await this.authService.loginWithEmailAndPassword({ email: 'max@mail.com', password: 'GuestUserJoin' });
		sessionStorage.setItem('token', resp.token);
		this.authService.currentUserSig.set(resp.user as UserInterface);
	}

	/**
	 * Creates a new guest user account, logs them in, and adds test data.
	 * @returns {Promise<void>} Promise that resolves when guest creation, login, and data addition are complete.
	 */
	async createGuest(): Promise<void> {
		await this.authService.signup(this.createGuestObj());
		await this.loginGuest();
		await this.addTestData();
	}

	/**
	 * Creates an object representing guest user details for account creation.
	 * @returns {{first_name: string, last_name: string, email: string, password: string}} The guest user details object.
	 */
	createGuestObj(): { first_name: string; last_name: string; email: string; password: string } {
		return { first_name: 'Max', last_name: 'Mustermann', email: 'max@mail.com', password: 'GuestUserJoin' };
	}

	/**
	 * Adds test contacts, tasks, and subtasks to the database for the guest user.
	 * @returns {Promise<void>} Promise that resolves when test data is fully added.
	 */
	async addTestData(): Promise<void> {
		for (let contact of this.contacts) {
			await this.addContact(contact);
		}
		for (let task of this.tasks) {
			const resp = await this.addTask(task);
			for (let subtask of task.subtasks) {
				await this.addSubtask(subtask, resp);
			}
		}
	}

	/**
	 * Adds a contact to the database, associating it with the current user.
	 * @param {ContactInterface} contact The contact data to add.
	 * @returns {Promise<void>} Promise that resolves when the contact is added.
	 */
	async addContact(contact: ContactInterface): Promise<void> {
		Object.assign(contact, { author: this.authService.currentUserSig()!.id });
		let resp = await this.dbService.postContact(contact);
		this.contactIds.push(resp.id!);
	}

	/**
	 * Adds a task to the database, assigning it random contacts.
	 * @param {TaskInterface} task The task data to add.
	 * @returns {Promise<TaskInterface>} Promise resolving to the added task.
	 */
	async addTask(task: TaskInterface): Promise<TaskInterface> {
		task.assigned_to = this.getRandomContacts();
		Object.assign(task, { author: this.authService.currentUserSig()?.id });
		let resp = await this.dbService.postTask(task as TaskInterface);
		return resp;
	}

	/**
	 * Adds a subtask associated with a specific task to the database.
	 * @param {SubtaskInterface} subtask The subtask data to add.
	 * @param {TaskInterface} resp The task to associate with the subtask.
	 * @returns {Promise<void>} Promise that resolves when the subtask is added.
	 */
	async addSubtask(subtask: SubtaskInterface, resp: TaskInterface): Promise<void> {
		subtask.task = resp.id!;
		await this.dbService.postSubtask(subtask);
	}

	/**
	 * Selects random contacts from the existing contact IDs for task assignment.
	 * @returns {number[]} An array of randomly selected contact IDs.
	 */
	getRandomContacts(): number[] {
		let randomContacts: number[] = [];
		while (randomContacts.length < 3) {
			const randContact = this.contactIds[Math.floor(Math.random() * this.contactIds.length)];
			if (!randomContacts.includes(randContact)) {
				randomContacts.push(randContact);
			}
		}
		return randomContacts;
	}

	contacts = [
		{
			first_name: 'Max',
			last_name: 'Mustermann',
			email: 'max@mail.com',
			phone: '+49 1111 111 11 1',
			color: '#FF4646',
		},
		{
			first_name: 'Sofia',
			last_name: 'Müller',
			email: 'sofiam@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#00BEE8',
		},
		{
			first_name: 'Anton',
			last_name: 'Mayer',
			email: 'antom@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#FF7A00',
		},
		{
			first_name: 'Anja',
			last_name: 'Schulz',
			email: 'schulz@hotmail.com',
			phone: '+49 1111 111 11 1',
			color: '#9327FF',
		},
		{
			first_name: 'Benedikt',
			last_name: 'Ziegler',
			email: 'benedikt@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#6E52FF',
		},
		{
			first_name: 'David',
			last_name: 'Eisenberg',
			email: 'davidberg@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#FC71FF',
		},
		{
			first_name: 'Eva',
			last_name: 'Fischer',
			email: 'eva@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#FFBB2B',
		},
		{
			first_name: 'Emmanuel',
			last_name: 'Mauer',
			email: 'emmanuelma@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#1FD7C1',
		},
		{
			first_name: 'Marcel',
			last_name: 'Bauer',
			email: 'bauer@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#462F8A',
		},
		{
			first_name: 'Tatjana',
			last_name: 'Wolf',
			email: 'wolf@gmail.com',
			phone: '+49 1111 111 11 1',
			color: '#FF4646',
		},
	];

	tasks = [
		{
			subtasks: [
				{
					title: 'Implement Recipe Recommendation',
					done: true,
					task: 0,
				},
				{
					title: 'Start Page Layout',
					done: false,
					task: 0,
				},
			],
			created_at: '2024-09-20',
			status: 'todo',
			title: 'Kochwelt Page & Recipe Recommender',
			description: 'Build start page with recipe recommendation.',
			due_date: '2025-10-05',
			prio: 2,
			category: 'User Story',
			author: 1,
			assigned_to: <number[]>[],
		},
		{
			subtasks: [
				{
					title: 'Establish CSS Methodology',
					done: false,
					task: 0,
				},
				{
					title: 'Setup Base Styles',
					done: false,
					task: 0,
				},
			],
			created_at: '2024-09-20',
			status: 'awaitFeedback',
			title: 'CSS Architecture Planning',
			description: 'Define CSS naming conventions and structure.',
			due_date: '2025-09-02',
			prio: 1,
			category: 'Technical Task',
			author: 1,
			assigned_to: <number[]>[],
		},
		{
			subtasks: [],
			created_at: '2024-09-20',
			status: 'inProgress',
			title: 'HTML Base Template Creation',
			description: 'Create reusable HTML base templates.',
			due_date: '2025-05-27',
			prio: 3,
			category: 'Technical Task',
			author: 1,
			assigned_to: <number[]>[],
		},
		{
			subtasks: [],
			created_at: '2024-09-20',
			status: 'awaitFeedback',
			title: 'Daily Kochwelt Recipe',
			description: 'Implement daily recipe and portion calculator.',
			due_date: '2025-05-27',
			prio: 3,
			category: 'Technical Task',
			author: 1,
			assigned_to: <number[]>[],
		},
		{
			subtasks: [
				{
					title: 'create Contact Form',
					done: false,
					task: 0,
				},
				{
					title: 'create Imprint',
					done: false,
					task: 0,
				},
			],
			created_at: '2024-09-20',
			status: 'todo',
			title: 'Contact Form & Imprint',
			description: 'Create a contact form and imprint page.',
			due_date: '2025-04-16',
			prio: 1,
			category: 'User Story',
			author: 1,
			assigned_to: <number[]>[],
		},
	];
}
