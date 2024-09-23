import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UtilityService } from '../../../services/utitily/utility.service';
import { Contact } from '../../../models/contact.class';

export const dateValidator = (today: string): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		let todayAsNumber = Number(today.replaceAll('-', ''));
		let dateAsNumber = control.value.split('/').reverse().join('');
		return dateAsNumber < todayAsNumber ? { dateInPast: "The date can't be in the past" } : null;
	};
};

export const categoryValidator = (categoryList: string[]): ValidatorFn => {
	return (control: AbstractControl): ValidationErrors | null => {
		return !categoryList.includes(control.value) ? { categoryDoesNotExist: 'Please select a category from the list' } : null;
	};
};

@Component({
	selector: 'app-add-task',
	standalone: true,
	imports: [ReactiveFormsModule, NgClass],
	templateUrl: './add-task.component.html',
	styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit {
	fb = inject(NonNullableFormBuilder);
	dbService = inject(DbService);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);

	assignedToDropdown: boolean = false;
	categoryDropdown: boolean = false;

	today: string = new Date().toISOString().split('T')[0];
	assignedToList: Contact[] = [];
	categoryList: string[] = ['Technical Task', 'User Story'];
	subtaskList: string[] = [];

	addTaskForm = this.fb.group({
		title: ['', [Validators.required]],
		description: ['', []],
		assignedTo: [this.assignedToList, []],
		dueDate: ['', [Validators.required, Validators.pattern('[0-9]{2}/[0-9]{2}/[0-9]{4}'), dateValidator(this.today)]],
		datePicker: ['', []],
		prio: [2, []],
		category: ['', [Validators.required, categoryValidator(this.categoryList)]],
		subtasks: [this.subtaskList, []],
	});

	ngOnInit(): void {}

	formInvalid(formControl: FormControl<string | boolean>): boolean {
		return formControl.invalid && (formControl.touched || formControl.dirty);
	}

	onSubmit(): void {
		this.dbService.addTask(this.addTaskForm.getRawValue()).subscribe({
			next: (resp) => {
				if (resp.hasOwnProperty('id') && resp.hasOwnProperty('status')) {
					this.resetAfterTaskCreation();
					this.dbService.tasksSig.update((prevTasks) => [...prevTasks, resp]);
				} else {
					console.log('error', resp);
				}
			},
		});
	}

	resetAfterTaskCreation(): void {
		this.addTaskForm.reset();
		this.assignedToList = [];
		this.subtaskList = [];
		this.utilityService.overlaySig.set(false);
		this.utilityService.taskStatus = 'todo';
	}

	transferDate(): void {
		const pickerValue = this.addTaskForm.controls.datePicker.value;
		let dueDate = this.addTaskForm.controls.dueDate;
		dueDate.setValue(pickerValue.split('-').reverse().join('/'));
	}

	selectContact(contact: Contact): void {
		if (this.contactIsSelected(contact)) {
			const index = this.assignedToList.findIndex((element) => element.id === contact.id);
			this.assignedToList.splice(index, 1);
		} else {
			this.assignedToList.push(contact);
		}
	}

	contactIsSelected(contact: Contact): boolean {
		return this.assignedToList.includes(contact);
	}

	prioIsSelected(prio: number): boolean {
		return this.addTaskForm.controls.prio.value === prio;
	}

	onFocus(elementName: string): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = true;
		if (elementName === 'category') this.categoryDropdown = true;
	}

	onBlur(elementName: string): void {
		if (elementName === 'assignedTo') this.assignedToDropdown = false;
		if (elementName === 'category') this.categoryDropdown = false;
	}

	setPrio(prio: number): void {
		this.addTaskForm.controls.prio.setValue(prio);
	}

	selectCategory(index: number): void {
		this.addTaskForm.controls.category.setValue(this.categoryList[index]);
		this.onBlur('category');
	}

	addSubtask(subtask: string): void {
		this.subtaskList.push(subtask);
	}

	deleteSubtask(index: number): void {
		this.subtaskList.splice(index, 1);
	}

	confirmSubtask(index: number, input: HTMLInputElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		this.subtaskList[index] = input.value;
		subtask.classList.remove('d_none');
		editSubtask.classList.add('d_none');
	}

	openSubtask(subtask: HTMLDivElement, editSubtask: HTMLDivElement): void {
		subtask.classList.add('d_none');
		editSubtask.classList.remove('d_none');
	}
}
