export interface SummaryInterface {
	allTasks: {
		count: number;
	};
	todo: {
		count: number;
	};
	in_progress: {
		count: number;
	};
	await_feedback: {
		count: number;
	};
	done: {
		count: number;
	};
	urgent: {
		count: number;
		most_urgent_date: string;
	};
}
