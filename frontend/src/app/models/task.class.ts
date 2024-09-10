export class Task {
	author: string;
	created_at: string;
	status: string;
	title: string;
	description: string;
	due_date: string;
	prio: number;
	category: string;

	constructor(obj?: any) {
		this.author = obj ? obj.author : '';
		this.created_at = obj ? obj.created_at : '';
		this.status = obj ? obj.status : '';
		this.title = obj ? obj.title : '';
		this.description = obj ? obj.description : '';
		this.due_date = obj ? obj.due_date : '';
		this.prio = obj ? obj.prio : '';
		this.category = obj ? obj.category : '';
	}
}
