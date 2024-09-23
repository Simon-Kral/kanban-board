import { Injectable, signal } from '@angular/core';
import { AddTaskComponent } from '../../components/post_login/add-task/add-task.component';

@Injectable({
	providedIn: 'root',
})
export class UtilityService {
	overlaySig = signal<Boolean>(false);
	embeddedComponent = AddTaskComponent;
	taskStatus: string = 'todo';

	constructor() {}
}
