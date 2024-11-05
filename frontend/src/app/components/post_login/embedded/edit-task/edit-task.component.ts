import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DbService } from '../../../../services/db/db.service';
import { NgClass } from '@angular/common';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { Contact } from '../../../../models/contact.class';
import { SubtaskInterface } from '../../../../interfaces/subtask';
import { TaskInterface } from '../../../../interfaces/task';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { UtilityService } from '../../../../services/utitily/utility.service';

/**
 * Validator function to check if the provided date is not in the past.
 * @param today - The current date as a string.
 * @returns A ValidatorFn that returns validation errors if the date is in the past.
 */
export const dateValidator = (today: string): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		let todayAsNumber = Number(today.replaceAll('-', ''));
		let dateAsNumber = control.value.split('/').reverse().join('');
		return dateAsNumber < todayAsNumber ? { dateInPast: "The date can't be in the past" } : null;
	};
};

@Component({
	selector: 'app-edit-task',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass],
	templateUrl: './edit-task.component.html',
	styleUrl: './edit-task.component.scss',
})
export class EditTaskComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	dbService = inject(DbService);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);

	searchValueSig = signal<string>('');
	visibleContactsSig = computed(() => {
		return this.dbService.contactsSig().filter((contact) => this.contactIncludesSearchValue(contact));
	});

	assignedToDropdown: boolean = false;

	data = this.utilityService.dataSig();

	today: string = new Date().toISOString().split('T')[0];
	assignedToList: Contact[] = this.dbService.contactsSig().filter((contact) => this.data.assigned_to.includes(contact.id));
	subtasksToDelete: number[] = [];

	editTaskForm = this.fb.group({
		title: [this.data.title, [Validators.required]],
		description: [this.data.description, []],
		dueDate: [this.data.due_date.split('-').reverse().join('/'), [Validators.required, Validators.pattern('[0-9]{2}/[0-9]{2}/[0-9]{4}'), dateValidator(this.today)]],
		datePicker: ['', []],
		prio: [this.data.prio, []],
		assignedTo: [this.assignedToList, []],
		subtasks: [this.data.subtasks, []],
	});

	/**
	 * Initializes the component and resets any backend errors in the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
		this.editTaskForm.controls.dueDate.markAsTouched();
	}

	// Form

	/**
	 * Handles the form submission process, including editing the task.
	 */
	async onSubmit(): Promise<void> {
		this.utilityService.loading = true;
		await this.editTask();
		this.utilityService.loading = false;
	}

	/**
	 * Edits the current task, including updating subtasks and sending the updated task to the database.
	 */
	async editTask(): Promise<void> {
		try {
			await this.editSubtasks();
			let newTask = this.createTaskObj();
			let resp = await this.dbService.patchTask(newTask);
			this.completeTaskUpdate(resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}

	/**
	 * Edits the subtasks associated with the current task, deleting any marked for deletion
	 * and updating or creating others as necessary.
	 */
	async editSubtasks(): Promise<void> {
		for (let id of this.subtasksToDelete) {
			await this.dbService.deleteSubtask(id);
		}
		for (let subtask of this.data.subtasks) {
			if (subtask.hasOwnProperty('id')) {
				await this.dbService.patchSubtask({ id: subtask.id, title: subtask.title });
			} else {
				await this.dbService.postSubtask(subtask);
			}
		}
	}

	// Data

	/**
	 * Creates a task object from the form data to be submitted to the database.
	 * @returns A partial TaskInterface object containing the task data.
	 */
	createTaskObj(): Partial<TaskInterface> {
		const rawData = this.editTaskForm.getRawValue();
		const task = {
			id: this.data.id,
			title: rawData.title,
			description: rawData.description,
			assigned_to: rawData.assignedTo.map((contact) => contact.id!),
			due_date: rawData.dueDate.split('/').reverse().join('-'),
			prio: rawData.prio,
		};
		return task;
	}

	/**
	 * Completes the task update process by updating the task signal and transitioning to the TaskDetailComponent.
	 * @param resp - The updated TaskInterface response from the database.
	 */
	completeTaskUpdate(resp: TaskInterface): void {
		this.utilityService.updateInSignal(this.dbService.tasksSig, resp);
		this.utilityService.dataSig.set(resp);
		this.utilityService.component = TaskDetailComponent;
	}

	// Searchbar

	/**
	 * Updates the search value based on user input.
	 * @param event - The input event containing the search value.
	 */
	changeSearchValue(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.searchValueSig.set(target.value);
	}

	/**
	 * Checks if a contact includes the search value in either their first or last name.
	 * @param contact - The contact to check against the search value.
	 * @returns True if the contact's name includes the search value, false otherwise.
	 */
	contactIncludesSearchValue(contact: Contact): boolean {
		const first_name = contact.first_name.toLowerCase();
		const last_name = contact.last_name.toLowerCase();
		const searchValue = this.searchValueSig().toLowerCase();
		return first_name.includes(searchValue) || last_name.includes(searchValue);
	}

	/**
	 * Checks if there are no contacts found based on the current search value.
	 * @returns True if no contacts are found, false otherwise.
	 */
	noContactsFound() {
		return !(this.visibleContactsSig().length > 0);
	}

	// Formdata

	/**
	 * Selects or deselects a contact for assignment to the task.
	 * @param contact - The contact to be selected or deselected.
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
	 * Transfers the date from the date picker to the due date form control.
	 */
	transferDate(): void {
		const pickerValue = this.editTaskForm.controls.datePicker.value;
		let dueDate = this.editTaskForm.controls.dueDate;
		dueDate.setValue(pickerValue.split('-').reverse().join('/'));
	}

	/**
	 * Sets the priority for the task in the form.
	 * @param prio - The priority level to set for the task.
	 */
	setPrio(prio: number): void {
		this.editTaskForm.controls.prio.setValue(prio);
	}

	/**
	 * Adds a new subtask to the current task's list of subtasks.
	 * @param subtask - The title of the subtask to be added.
	 */
	addSubtask(subtask: string): void {
		this.data.subtasks.push({ title: subtask, task: this.data.id });
	}

	/**
	 * Marks a subtask for deletion by adding its ID to the list of subtasks to delete.
	 * @param index - The index of the subtask to be deleted.
	 */
	deleteSubtask(index: number): void {
		let id = this.data.subtasks[index].id;
		this.subtasksToDelete.push(id);
		this.data.subtasks.splice(index, 1);
	}

	/**
	 * Confirms the editing of a subtask and updates its title in the task data.
	 * @param subtaskElement - The HTML element of the subtask to be edited.
	 * @param index - The index of the subtask in the list.
	 * @param input - The input element containing the new title for the subtask.
	 * @param subtask - The HTML element representing the subtask.
	 * @param editSubtask - The HTML element representing the edit view of the subtask.
	 */
	confirmSubtask(subtaskElement: HTMLDivElement, index: number, input: HTMLInputElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		this.data.subtasks[index].title = input.value;
		this.closeSubtask(subtaskElement, subtask, editSubtask);
	}

	// Markup

	/**
	 * Checks if a contact is currently selected for assignment to the task.
	 * @param contact - The contact to check.
	 * @returns True if the contact is selected, false otherwise.
	 */
	contactIsSelected(contact: Contact): boolean {
		return this.assignedToList.includes(contact);
	}

	/**
	 * Checks if the given priority level is currently selected in the form.
	 * @param prio - The priority level to check.
	 * @returns True if the priority is selected, false otherwise.
	 */
	prioIsSelected(prio: number): boolean {
		return this.editTaskForm.controls.prio.value === prio;
	}

	/**
	 * Opens the editing view for a subtask.
	 * @param subtaskElement - The HTML element of the subtask to be edited.
	 * @param subtask - The HTML element representing the subtask.
	 * @param editSubtask - The HTML element representing the edit view of the subtask.
	 */
	openSubtask(subtaskElement: HTMLDivElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		subtaskElement.classList.add('subtask_element_edit');
		subtask.classList.add('d_none');
		editSubtask.classList.remove('d_none');
	}

	/**
	 * Closes the editing view for a subtask.
	 * @param subtaskElement - The HTML element of the subtask being edited.
	 * @param subtask - The HTML element representing the subtask.
	 * @param editSubtask - The HTML element representing the edit view of the subtask.
	 */
	closeSubtask(subtaskElement: HTMLDivElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement) {
		subtaskElement.classList.remove('subtask_element_edit');
		subtask.classList.remove('d_none');
		editSubtask.classList.add('d_none');
	}

	/**
	 * Handles the focus event for UI elements, specifically to show dropdowns.
	 * @param elementName - The name of the element being focused.
	 * @param img - The image element associated with the focused element.
	 */
	onFocus(elementName: string, img: HTMLImageElement): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = true;
		img.classList.add('flip');
	}

	/**
	 * Handles the blur event for UI elements, specifically to hide dropdowns.
	 * @param elementName - The name of the element losing focus.
	 * @param img - The image element associated with the blurred element.
	 */
	onBlur(elementName: string, img: HTMLImageElement): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = false;
		img.classList.remove('flip');
	}
}
