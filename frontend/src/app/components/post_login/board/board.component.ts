import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { NgClass } from '@angular/common';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TaskDetailComponent } from '../embedded/task-detail/task-detail.component';
import { TaskInterface } from '../../../interfaces/task';
import { SubtaskInterface } from '../../../interfaces/subtask';

@Component({
	selector: 'app-board',
	standalone: true,
	imports: [NgClass],
	templateUrl: './board.component.html',
	styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
	authService = inject(AuthService);
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	searchValueSig = signal<string>('');
	visibleTasksSig = computed(() => {
		return this.dbService.tasksSig().filter((task) => this.taskIncludesSearchValue(task));
	});

	currentDragItem: TaskInterface | undefined = undefined;

	/**
	 * Initializes the component by resetting any backend errors on the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
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
	 * Checks if the specified task's title or description includes the current search value.
	 * @param task - The task object to search within.
	 * @returns True if the task's title or description contains the search value; otherwise, false.
	 */
	taskIncludesSearchValue(task: TaskInterface): boolean {
		const title = task.title.toLowerCase();
		const description = task.description.toLowerCase();
		const searchValue = this.searchValueSig().toLowerCase();
		return title.includes(searchValue) || description.includes(searchValue);
	}

	/**
	 * Determines if there are no tasks that match the current search criteria.
	 * @returns True if no visible tasks are found; otherwise, false.
	 */
	noTasksFound(): boolean {
		return !(this.visibleTasksSig().length > 0);
	}

	// Data

	/**
	 * Checks if there are no tasks for the specified status in the current visible tasks.
	 * @param status - The status to check for tasks.
	 * @returns True if there are no tasks with the specified status; otherwise, false.
	 */
	noTasksForColumn(status: string): boolean {
		return !this.visibleTasksSig()!.find((task) => task.status === status);
	}

	/**
	 * Updates the status of a given task in the database.
	 * @param task - The task object (partial) to update.
	 * @returns A promise that resolves when the task status has been updated.
	 */
	async updateTaskStatus(task: Partial<TaskInterface>): Promise<void> {
		try {
			let resp = await this.dbService.patchTask(task);
			this.utilityService.updateInSignal(this.dbService.tasksSig, resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}

	/**
	 * Returns the number of subtasks for a given task.
	 * @param subtasks - An array of subtasks associated with the task.
	 * @returns The count of subtasks.
	 */
	getSubtasksAmount(subtasks: SubtaskInterface[]): number {
		return subtasks.length;
	}

	/**
	 * Returns the number of finished subtasks for a given task.
	 * @param subtasks - An array of subtasks associated with the task.
	 * @returns The count of subtasks that are marked as done.
	 */
	getFinishedSubtasksAmount(subtasks: SubtaskInterface[]): number {
		return subtasks.filter((subtask) => subtask.done).length;
	}

	// Overlay

	/**
	 * Opens the task detail component for viewing the details of the selected task.
	 * @param task - The task object to display in the task detail component.
	 */
	openTask(task: TaskInterface): void {
		this.utilityService.dataSig.set(task);
		this.utilityService.component = TaskDetailComponent;
	}

	/**
	 * Opens the add task component for creating a new task with a specified status.
	 * @param status - The status to assign to the new task.
	 */
	openAddTask(status: string): void {
		this.utilityService.taskStatus = status;
		this.utilityService.component = AddTaskComponent;
	}

	// Drag / Drop

	/**
	 * Handles the drag start event by storing the currently dragged task.
	 * @param task - The task that is being dragged.
	 */
	onDragStart(task: TaskInterface): void {
		this.currentDragItem = task;
	}

	/**
	 * Handles the drop event for moving a task to a new status.
	 * @param status - The new status to assign to the dragged task.
	 * @param moveHere - The target element where the task is dropped.
	 * @returns A promise that resolves once the task has been updated in the database.
	 */
	async onDrop(status: string, moveHere: any): Promise<void> {
		this.utilityService.loading = true;
		await this.updateTaskStatus({ id: this.currentDragItem!.id, status: status });
		this.utilityService.loading = false;
		moveHere.classList.add('transparent');
	}

	/**
	 * Handles the drag over event to allow dropping a task onto a target element.
	 * @param event - The drag event.
	 * @param moveHere - The target element where the task can be dropped.
	 */
	onDragOver(event: Event, moveHere: any): void {
		event.preventDefault();
		moveHere.classList.remove('transparent');
	}

	/**
	 * Handles the drag leave event when a dragged task leaves a potential drop target.
	 * @param event - The drag event.
	 * @param moveHere - The target element that is no longer being hovered over.
	 */
	onDragLeave(event: Event, moveHere: any): void {
		event.preventDefault();
		moveHere.classList.add('transparent');
	}
}
