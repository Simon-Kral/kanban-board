import { Component, inject, OnInit } from '@angular/core';
import { DbService } from '../../../../services/db/db.service';
import { NgClass, NgStyle } from '@angular/common';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { UtilityService } from '../../../../services/utitily/utility.service';
import { SubtaskInterface } from '../../../../interfaces/subtask';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskInterface } from '../../../../interfaces/task';

@Component({
	selector: 'app-task-detail',
	standalone: true,
	imports: [NgClass, NgStyle],
	templateUrl: './task-detail.component.html',
	styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
	dbService = inject(DbService);
	utilityService = inject(UtilityService);

	data = this.utilityService.dataSig();

	/**
	 * Initializes the component and resets any backend errors in the database service.
	 */
	ngOnInit(): void {
		this.dbService.resetBackendErrors();
	}

	// Overlay

	/**
	 * Opens the edit task component for modifying the current task.
	 */
	openEditTask(): void {
		this.utilityService.component = EditTaskComponent;
	}

	/**
	 * Toggles the visibility of the move menu.
	 * If the move menu is currently visible, it will be hidden,
	 * and if it is hidden, it will be displayed.
	 */
	toggleMoveMenu(): void {
		this.utilityService.moveMenu = !this.utilityService.moveMenu;
	}

	/**
	 * Closes the move menu, setting its visibility to false.
	 */
	closeMoveMenu(): void {
		this.utilityService.moveMenu = false;
	}

	// Data

	/**
	 * Checks or unchecks a subtask as done and updates its status in the database.
	 * @param task - The parent task to which the subtask belongs.
	 * @param subtask - The subtask to be checked or unchecked.
	 */
	async checkSubtask(task: TaskInterface, subtask: SubtaskInterface): Promise<void> {
		this.utilityService.loading = true;
		try {
			subtask.done = !subtask.done;
			let resp = await this.dbService.patchSubtask(subtask);
			this.utilityService.updateInSignal(this.dbService.tasksSig, resp, task.id!);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	/**
	 * Deletes the current task from the database and updates the UI accordingly.
	 */
	async deleteTask(): Promise<void> {
		this.utilityService.loading = true;
		try {
			const id = this.utilityService.dataSig()!.id;
			await this.dbService.deleteTask(id);
			this.completeTaskDelete(id);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
		this.utilityService.loading = false;
	}

	/**
	 * Completes the task deletion process by removing the task from the UI state.
	 * @param id - The ID of the task to be removed.
	 */
	completeTaskDelete(id: number): void {
		this.utilityService.removeFromSignal(this.dbService.tasksSig, id);
		this.utilityService.hideOverlay(true);
	}

	/**
	 * Retrieves the priority of the current task, formatted as a capitalized string.
	 * @returns The capitalized string representation of the task's priority.
	 */
	getPrio() {
		return this.utilityService.capitalize(this.utilityService.getPrioStrFromNr(this.data.prio));
	}

	/**
	 * Moves the current task to a specified status and updates the task status in the database.
	 * @param status - The new status to set for the task.
	 */
	async moveTask(status: string): Promise<void> {
		this.utilityService.loading = true;
		await this.updateTaskStatus({ id: this.data.id, status: status });
		this.utilityService.loading = false;
		this.closeMoveMenu();
		this.utilityService.hideOverlay(true);
	}

	/**
	 * Updates the status of a task in the database.
	 * @param task - The task object with the updated status information.
	 */
	async updateTaskStatus(task: Partial<TaskInterface>): Promise<void> {
		try {
			let resp = await this.dbService.patchTask(task);
			this.utilityService.updateInSignal(this.dbService.tasksSig, resp);
		} catch (error) {
			this.dbService.handleBackendErrors(error);
		}
	}
}
