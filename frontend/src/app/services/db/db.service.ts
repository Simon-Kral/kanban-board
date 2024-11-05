import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { lastValueFrom, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Contact } from '../../models/contact.class';
import { TaskInterface } from '../../interfaces/task';
import { SubtaskInterface } from '../../interfaces/subtask';
import { ContactInterface } from '../../interfaces/contact';
import { SummaryInterface } from '../../interfaces/summary';

@Injectable({
	providedIn: 'root',
})
export class DbService {
	http = inject(HttpClient);
	authService = inject(AuthService);

	contactsSig = signal<Contact[]>([]);
	tasksSig = signal<TaskInterface[]>([]);
	backendErrorsSig = signal<any>(undefined);

	constructor() {}

	// GET

	/**
	 * Retrieves the list of contacts from the backend.
	 * @returns {Promise<ContactInterface[]>} A promise that resolves with an array of contact data.
	 */
	getContactsData(): Promise<ContactInterface[]> {
		const url = environment.baseUrl + '/contacts/';
		return lastValueFrom(this.http.get<ContactInterface[]>(url));
	}

	/**
	 * Retrieves the list of tasks from the backend.
	 * @returns {Promise<TaskInterface[]>} A promise that resolves with an array of task data.
	 */
	getTasksData(): Promise<TaskInterface[]> {
		const url = environment.baseUrl + '/tasks/';
		return lastValueFrom(this.http.get<TaskInterface[]>(url));
	}

	/**
	 * Retrieves summary data for the current user from the backend.
	 * @returns {Promise<SummaryInterface>} A promise that resolves with summary data.
	 */
	getSummaryData(): Promise<SummaryInterface> {
		const url = environment.baseUrl + '/summary/';
		return lastValueFrom(this.http.get<SummaryInterface>(url));
	}

	// POST

	/**
	 * Adds a new contact to the backend.
	 * @param {ContactInterface} contact The contact data to be added.
	 * @returns {Promise<ContactInterface>} A promise that resolves with the added contact data.
	 */
	postContact(contact: ContactInterface): Promise<ContactInterface> {
		const url = environment.baseUrl + '/contacts/';
		const body = contact;
		return lastValueFrom(this.http.post(url, body) as Observable<ContactInterface>);
	}

	/**
	 * Adds a new task to the backend.
	 * @param {TaskInterface} task The task data to be added.
	 * @returns {Promise<TaskInterface>} A promise that resolves with the added task data.
	 */
	postTask(task: any): Promise<TaskInterface> {
		const url = environment.baseUrl + '/tasks/';
		const body = task;
		return lastValueFrom(this.http.post(url, body) as Observable<TaskInterface>);
	}

	/**
	 * Adds a new subtask to the backend.
	 * @param {SubtaskInterface} subtask The subtask data to be added.
	 * @returns {Promise<SubtaskInterface>} A promise that resolves with the added subtask data.
	 */
	postSubtask(subtask: any): Promise<SubtaskInterface> {
		const url = environment.baseUrl + '/subtasks/';
		const body = subtask;
		return lastValueFrom(this.http.post(url, body) as Observable<SubtaskInterface>);
	}

	// PUT / PATCH

	/**
	 * Updates an existing contact with new data.
	 * @param {Partial<Contact>} contact The partial contact data to update.
	 * @returns {Promise<Contact>} A promise that resolves with the updated contact data.
	 */
	updateContact(contact: Partial<Contact>): Promise<Contact> {
		const url = environment.baseUrl + '/contacts/' + contact.id + '/';
		const body = contact;
		return lastValueFrom(this.http.patch(url, body) as Observable<Contact>);
	}

	/**
	 * Updates an existing task with new data.
	 * @param {Partial<TaskInterface>} task The partial task data to update.
	 * @returns {Promise<TaskInterface>} A promise that resolves with the updated task data.
	 */
	patchTask(task: Partial<TaskInterface>): Promise<TaskInterface> {
		const url = environment.baseUrl + '/tasks/' + task.id + '/';
		const body = task;
		return lastValueFrom(this.http.patch(url, body) as Observable<TaskInterface>);
	}

	/**
	 * Updates an existing subtask with new data.
	 * @param {Partial<SubtaskInterface>} subtask The partial subtask data to update.
	 * @returns {Promise<SubtaskInterface>} A promise that resolves with the updated subtask data.
	 */
	patchSubtask(subtask: Partial<SubtaskInterface>): Promise<SubtaskInterface> {
		const url = environment.baseUrl + '/subtasks/' + subtask.id + '/';
		const body = subtask;
		return lastValueFrom(this.http.patch(url, body) as Observable<SubtaskInterface>);
	}

	// DELETE

	/**
	 * Deletes a contact from the backend.
	 * @param {number} id The ID of the contact to delete.
	 * @returns {Promise<Object>} A promise that resolves when the contact is deleted.
	 */
	deleteContact(id: number): Promise<Object> {
		const url = environment.baseUrl + '/contacts/' + id + '/';
		return lastValueFrom(this.http.delete(url) as Observable<Object>);
	}

	/**
	 * Deletes a task from the backend.
	 * @param {number} id The ID of the task to delete.
	 * @returns {Promise<Object>} A promise that resolves when the task is deleted.
	 */
	deleteTask(id: number): Promise<Object> {
		const url = environment.baseUrl + '/tasks/' + id + '/';
		return lastValueFrom(this.http.delete(url) as Observable<Object>);
	}

	/**
	 * Deletes a subtask from the backend.
	 * @param {number} id The ID of the subtask to delete.
	 * @returns {Promise<Object>} A promise that resolves when the subtask is deleted.
	 */
	deleteSubtask(id: number): Promise<Object> {
		const url = environment.baseUrl + '/subtasks/' + id + '/';
		return lastValueFrom(this.http.delete(url) as Observable<Object>);
	}

	// Backend Errors

	/**
	 * Handles backend errors by identifying them and delegating to error rendering.
	 * @param {unknown} error The error object to handle.
	 */
	handleBackendErrors(error: unknown) {
		if (error instanceof HttpErrorResponse) {
			this.renderBackendErrors(error);
		}
	}

	/**
	 * Processes and stores backend error messages for display.
	 * @param {HttpErrorResponse} error The HTTP error response containing backend error details.
	 */
	renderBackendErrors(error: HttpErrorResponse) {
		this.backendErrorsSig.update(() => {
			let backendErrors = [];
			for (let value of Object.values(error.error)) {
				backendErrors.push(value);
			}
			return [...backendErrors];
		});
	}

	/**
	 * Resets stored backend errors.
	 */
	resetBackendErrors() {
		this.backendErrorsSig.update(() => undefined);
	}
}
