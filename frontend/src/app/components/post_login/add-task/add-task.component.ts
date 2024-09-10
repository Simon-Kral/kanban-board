import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { User } from '../../../models/user.class';

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
	users: User[] = [];

	addTaskForm = this.fb.group({
		title: ['', [Validators.required]],
		description: ['', []],
		assignedTo: ['', [Validators.required]],
		dueDate: ['', []],
		prio: [1, []],
		category: ['', [Validators.required]],
		subtasks: ['', []],
	});

	ngOnInit(): void {
		this.dbService.getUsers().subscribe({
			next: (users) => {
				users.forEach((user) => {});
			},
		});
	}

	formInvalid(formControl: FormControl<string | boolean>) {
		return formControl.invalid && (formControl.touched || formControl.dirty);
	}

	onSubmit() {}
}
