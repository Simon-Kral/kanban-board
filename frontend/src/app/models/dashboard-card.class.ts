export class DashboardCard {
	name: string;
	amount: number;
	description: string;

	constructor(obj: any) {
		this.name = obj.name;
		this.amount = obj.amount ? obj.amount : 0;
		this.description = obj.description;
	}
}
