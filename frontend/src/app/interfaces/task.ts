import { SubtaskInterface } from './subtask';

export interface TaskInterface {
	id?: number;
	author: number;
	created_at?: string;
	status: string;
	title: string;
	description: string;
	due_date: string;
	prio: number;
	category: string;
	assigned_to: number[];
	subtasks?: SubtaskInterface[];
}
