export class User {
	id?: number | undefined;
	password?: string | undefined;
	email: string;
	first_name: string;
	last_name: string;
	initials: string;

	constructor(obj?: any) {
		const first_name_pattern = /^[\w]+(?=(\s{1}[\w]+)+)/;
		const last_name_pattern = /(?<=^[\w]+\s{1})([\w]+\s?)+/;
		this.id = obj.id ? obj.id : undefined;
		this.password = obj.password ? obj.password : undefined;
		this.email = obj.email ? obj.email : 'not found';
		this.first_name = obj.name ? obj.name.match(first_name_pattern)![0] : obj.first_name ? obj.first_name : '';
		this.last_name = obj.name ? obj.name.match(last_name_pattern)![0] : obj.last_name ? obj.last_name : '';
		this.initials = obj.initials ? obj.initials : 'not found';
	}
}
