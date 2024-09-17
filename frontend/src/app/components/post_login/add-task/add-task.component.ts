import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { User } from '../../../models/user.class';

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
	cdr = inject(ChangeDetectorRef);
	fb = inject(NonNullableFormBuilder);
	dbService = inject(DbService);
	usersSig = signal<User[] | null>([]);
	today: string = new Date().toISOString().split('T')[0];
	assignedToDropdown: Boolean = false;
	categoryDropdown: Boolean = false;
	assignedToList: User[] = [];
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

	ngOnInit(): void {
		this.dbService.getContacts().subscribe({
			next: (contactsList) => {
				let users: User[] = [];
				contactsList.forEach((contactData) => {
					const user = new User(contactData);
					users.push(user);
				});
				this.usersSig.set(users);
				this.cdr.markForCheck();
			},
		});
	}

	formInvalid(formControl: FormControl<string | boolean>) {
		return formControl.invalid && (formControl.touched || formControl.dirty);
	}

	onSubmit() {
		console.log(this.addTaskForm.value);
		this.dbService.addTask(this.addTaskForm.value).subscribe({
			next: (resp) => {
				if (resp === 'task created') {
					console.log(resp);
					this.addTaskForm.reset();
					this.assignedToList = [];
					this.subtaskList = [];
				} else {
					console.log('error', resp);
				}
			},
		});
	}

	transferDate() {
		const pickerValue = this.addTaskForm.controls.datePicker.value;
		let dueDate = this.addTaskForm.controls.dueDate;
		dueDate.setValue(pickerValue.split('-').reverse().join('/'));
	}

	getUserStyle(user: User) {
		return { 'background-color': user.color };
	}

	selectUser(user: User) {
		if (this.assignedToList.includes(user)) {
			const index = this.assignedToList.findIndex((element) => element.id === user.id);
			this.assignedToList.splice(index);
		} else {
			this.assignedToList.push(user);
		}
	}

	userIsSelected(user: User) {
		return this.addTaskForm.controls.assignedTo.value.includes(user);
	}

	prioIsSelected(prio: number) {
		return this.addTaskForm.controls.prio.value === prio;
	}

	onFocus(elementName: string) {
		if (elementName === 'assignedTo') this.assignedToDropdown = true;
		if (elementName === 'category') this.categoryDropdown = true;
	}

	onBlur(elementName: string) {
		if (elementName === 'assignedTo') this.assignedToDropdown = false;
		if (elementName === 'category') this.categoryDropdown = false;
	}

	setPrio(prio: number) {
		this.addTaskForm.controls.prio.setValue(prio);
	}

	selectCategory(index: number) {
		this.addTaskForm.controls.category.setValue(this.categoryList[index]);
		this.onBlur('category');
	}

	addSubtask(subtask: string) {
		this.subtaskList.push(subtask);
	}

	deleteSubtask(index: number) {
		this.subtaskList.splice(index, 1);
	}

	confirmSubtask(index: number, input: HTMLInputElement, subtask: HTMLDivElement, editSubtask: HTMLDivElement) {
		this.subtaskList[index] = input.value;
		subtask.classList.remove('d_none');
		editSubtask.classList.add('d_none');
	}

	openSubtask(subtask: HTMLDivElement, editSubtask: HTMLDivElement) {
		subtask.classList.add('d_none');
		editSubtask.classList.remove('d_none');
	}
}
