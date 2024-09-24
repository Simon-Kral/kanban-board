import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Task } from '../../../interfaces/task';
import { NgClass } from '@angular/common';
import { UtilityService } from '../../../services/utitily/utility.service';
import { AddTaskComponent } from '../add-task/add-task.component';

@Component({
	selector: 'app-board',
	standalone: true,
	imports: [NgClass],
	templateUrl: './board.component.html',
	styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
	cdr = inject(ChangeDetectorRef);
	authService = inject(AuthService);
	utilityService = inject(UtilityService);
	dbService = inject(DbService);

	currentDragItem: Task | undefined = undefined;

	ngOnInit(): void {}

	changeSearchValue(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.dbService.searchValueSig.set(target.value);
	}

	noTasksFound(status: string): boolean {
		return !this.dbService.visibleTasksSig()!.find((task) => task.status === status);
	}

	onDragStart(task: Task): void {
		this.currentDragItem = task;
	}

	onDrop(status: string): void {
		this.updateTaskStatus(this.currentDragItem!.id, status);
	}

	onDragOver(event: Event): void {
		event.preventDefault();
	}

	openAddTask(status: string): void {
		this.utilityService.taskStatus = status;
		this.utilityService.embeddedComponentSig.set(AddTaskComponent);
		this.utilityService.overlaySig.set(true);
	}

	updateTaskStatus(taskId: number, newStatus: string): void {
		this.dbService.updateTask(taskId, { status: newStatus }).subscribe({
			next: (resp) => {
				if (resp.status) {
					this.updateTasksSig(resp, taskId);
				}
			},
		});
	}

	updateTasksSig(resp: Task, taskId: number) {
		let tasks = this.dbService.tasksSig();
		tasks.find((task) => task.id === taskId)!.status = resp.status;
		this.dbService.tasksSig.set(tasks);
		this.cdr.markForCheck();
	}
}
