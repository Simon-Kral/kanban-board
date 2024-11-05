import { NgClass, NgStyle } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UtilityService } from '../../../services/utitily/utility.service';
import { Contact } from '../../../models/contact.class';
import { TaskInterface } from '../../../interfaces/task';
import { SubtaskInterface } from '../../../interfaces/subtask';
import { ContactInterface } from '../../../interfaces/contact';

// Custom Validators

/**
 * A custom validator that checks if the provided date is in the past.
 * @param today - The current date as a string in the format 'YYYY-MM-DD'.
 * @returns A ValidatorFn that checks if the control's value is a date in the past.
 */
export const dateValidator = (today: string): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		let todayAsNumber = Number(today.replaceAll('-', ''));
		let dateAsNumber = control.value.split('/').reverse().join('');
		return dateAsNumber < todayAsNumber ? { dateInPast: "The date can't be in the past" } : null;
	};
};

/**
 * A custom validator that checks if the selected category exists in the provided category list.
 * @param categoryList - An array of valid categories.
 * @returns A ValidatorFn that validates if the control's value is in the category list.
 */
export const categoryValidator = (categoryList: string[]): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		return !categoryList.includes(control.value) ? { categoryDoesNotExist: 'Please select a category from the list' } : null;
	};
};

@Component({
	selector: 'app-add-task',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass, NgStyle],
	templateUrl: './add-task.component.html',
	styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	dbService = inject(DbService);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);

	searchValueSig = signal<string>('');
	visibleContactsSig = computed(() => {
		return this.dbService.contactsSig().filter((contact) => this.contactIncludesSearchValue(contact));
	});

	assignedToDropdown: boolean = false;
	categoryDropdown: boolean = false;

	today: string = new Date().toISOString().split('T')[0];
	assignedToList: Contact[] = [];
	categoryList: string[] = ['Technical Task', 'User Story'];
	subtaskTitles: string[] = [];

	addTaskForm = this.fb.group({
		title: ['', [Validators.required]],
		description: ['', []],
		assignedTo: [this.assignedToList, []],
		dueDate: ['', [Validators.required, Validators.pattern('[0-9]{2}/[0-9]{2}/[0-9]{4}'), dateValidator(this.today)]],
		datePicker: ['', []],
		prio: [2, []],
		category: ['', [Validators.required, categoryValidator(this.categoryList)]],
		subtasks: [this.subtaskTitles, []],
	});

	/**
	 * Initializes the component by resetting any backend errors on the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Form

	/**
	 * Handles form submission and triggers task addition process.
	 * Sets loading state during the operation.
	 * @returns A promise that resolves when the task has been added.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		await this.addTask();
		this.utilityService.loading = false;
	}

	/**
	 * Adds a new task to the database after creating the task object.
	 * @returns A promise that resolves when the task has been successfully added.
	 */
	async addTask(): Promise<void> {
		try {
			const newTask = this.createTaskObj();
			let resp = await this.dbService.postTask(newTask);
			resp.subtasks = await this.addSubtasks(resp.id!);
			this.completeTaskAdd(resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}

	/**
	 * Adds subtasks to a task based on the provided task ID.
	 * @param taskId - The ID of the task to which subtasks will be added.
	 * @returns An array of created subtasks.
	 */
	async addSubtasks(taskId: number): Promise<SubtaskInterface[]> {
		let subtasks: SubtaskInterface[] = [];
		for (let subtask of this.subtaskTitles) {
			let resp = await this.dbService.postSubtask({ title: subtask, task: taskId });
			subtasks.push(resp as SubtaskInterface);
		}
		return subtasks;
	}

	/**
	 * Resets the task form and related properties to their initial states.
	 */
	resetForm(): void {
		this.addTaskForm.reset();
		this.assignedToList = [];
		this.subtaskTitles = [];
		this.utilityService.taskStatus = 'todo';
		this.utilityService.component = undefined;
	}

	// Data

	/**
	 * Creates a task object from the form values.
	 * @returns The constructed task object to be sent to the database.
	 */
	createTaskObj(): TaskInterface {
		const rawData = this.addTaskForm.getRawValue();
		const task = {
			author: this.authService.currentUserSig()!.id,
			title: rawData.title,
			description: rawData.description,
			assigned_to: rawData.assignedTo.map((contact) => contact.id!),
			due_date: rawData.dueDate.split('/').reverse().join('-'),
			prio: rawData.prio,
			category: rawData.category,
			status: this.utilityService.taskStatus,
		};
		return task;
	}

	/**
	 * Completes the task addition process by updating the signal and resetting the form.
	 * Notifies the user about the successful task addition.
	 * @param resp - The response object representing the added task.
	 */
	completeTaskAdd(resp: TaskInterface): void {
		this.utilityService.addToSignal(this.dbService.tasksSig, resp);
		this.resetForm();
		if (!this.utilityService.component) this.utilityService.notificateUser('Task added to board');
	}

	// Searchbar

	/**
	 * Updates the search value signal based on user input from the search bar.
	 * @param event - The input event triggered by the user typing in the search bar.
	 */
	changeSearchValue(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.searchValueSig.set(target.value);
	}

	/**
	 * Checks if the specified contact's first or last name includes the current search value.
	 * @param contact - The contact object to search within.
	 * @returns True if the contact's name matches the search value; otherwise, false.
	 */
	contactIncludesSearchValue(contact: Contact): boolean {
		const first_name = contact.first_name.toLowerCase();
		const last_name = contact.last_name.toLowerCase();
		const searchValue = this.searchValueSig().toLowerCase();
		return first_name.includes(searchValue) || last_name.includes(searchValue);
	}

	/**
	 * Determines if there are no contacts that match the current search criteria.
	 * @returns True if no visible contacts are found; otherwise, false.
	 */
	noContactsFound(): boolean {
		return !(this.visibleContactsSig().length > 0);
	}

	// Formdata

	/**
	 * Toggles the selection of a contact for the task assignment.
	 * @param contact - The contact object to be toggled in the assigned list.
	 */
	selectContact(contact: Contact): void {
		if (this.contactIsSelected(contact)) {
			const index = this.assignedToList.findIndex((element) => element.id === contact.id);
			this.assignedToList.splice(index, 1);
		} else {
			this.assignedToList.push(contact);
		}
	}

	/**
	 * Transfers the date from the date picker input to the due date field in the form.
	 */
	transferDate(): void {
		const pickerValue = this.addTaskForm.controls.datePicker.value;
		let dueDate = this.addTaskForm.controls.dueDate;
		dueDate.setValue(pickerValue.split('-').reverse().join('/'));
	}

	/**
	 * Sets the priority value in the form for the task.
	 * @param prio - The priority level to set for the task.
	 */
	setPrio(prio: number): void {
		this.addTaskForm.controls.prio.setValue(prio);
	}

	/**
	 * Sets the selected category in the form based on the provided index.
	 * @param index - The index of the category in the category list.
	 */
	selectCategory(index: number): void {
		this.addTaskForm.controls.category.setValue(this.categoryList[index]);
	}

	/**
	 * Adds a new subtask title to the list of subtasks.
	 * @param subtask - The title of the subtask to add.
	 */
	addSubtask(subtask: string): void {
		this.subtaskTitles.push(subtask);
	}

	/**
	 * Deletes a subtask title from the list based on its index.
	 * @param index - The index of the subtask to delete.
	 */
	deleteSubtask(index: number): void {
		this.subtaskTitles.splice(index, 1);
	}

	/**
	 * Confirms the edit of a subtask by updating its title and closing the edit view.
	 * @param subtaskElement - The HTML element representing the subtask.
	 * @param index - The index of the subtask being edited.
	 * @param input - The input element containing the new subtask title.
	 * @param subtask - The HTML element of the subtask.
	 * @param editSubtask - The HTML element for editing the subtask.
	 */
	confirmSubtask(subtaskElement: HTMLDivElement, index: number, input: HTMLInputElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		this.subtaskTitles[index] = input.value;
		this.closeSubtask(subtaskElement, subtask, editSubtask);
	}

	// Markup

	/**
	 * Checks if a contact is currently selected for assignment.
	 * @param contact - The contact object to check.
	 * @returns True if the contact is selected; otherwise, false.
	 */
	contactIsSelected(contact: Contact): boolean {
		return this.assignedToList.includes(contact);
	}

	/**
	 * Checks if the specified priority is currently selected in the form.
	 * @param prio - The priority level to check.
	 * @returns True if the priority is selected; otherwise, false.
	 */
	prioIsSelected(prio: number): boolean {
		return this.addTaskForm.controls.prio.value === prio;
	}

	/**
	 * Opens the edit view for a subtask element, allowing it to be modified.
	 * @param subtaskElement - The HTML element representing the subtask.
	 * @param subtask - The HTML element of the subtask being edited.
	 * @param editSubtask - The HTML element for the edit interface of the subtask.
	 */
	openSubtask(subtaskElement: HTMLDivElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		subtaskElement.classList.add('subtask_element_edit');
		subtask.classList.add('d_none');
		editSubtask.classList.remove('d_none');
	}

	/**
	 * Closes the edit view for a subtask, restoring the original display.
	 * @param subtaskElement - The HTML element representing the subtask.
	 * @param subtask - The HTML element of the subtask.
	 * @param editSubtask - The HTML element for editing the subtask.
	 */
	closeSubtask(subtaskElement: HTMLDivElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		subtaskElement.classList.remove('subtask_element_edit');
		subtask.classList.remove('d_none');
		editSubtask.classList.add('d_none');
	}

	/**
	 * Handles focus events on form elements, enabling dropdowns and adding visual effects.
	 * @param elementName - The name of the element that received focus.
	 * @param img - The image element that might be affected visually.
	 */
	onFocus(elementName: string, img: HTMLImageElement): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = true;
		if (elementName === 'category') this.categoryDropdown = true;
		img.classList.add('flip');
	}

	/**
	 * Handles blur events on form elements, disabling dropdowns and removing visual effects.
	 * @param elementName - The name of the element that lost focus.
	 * @param img - The image element that might be affected visually.
	 */
	onBlur(elementName: string, img: HTMLImageElement): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = false;
		if (elementName === 'category') this.categoryDropdown = false;
		img.classList.remove('flip');
	}
}
