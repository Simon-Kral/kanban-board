import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { Task } from '../../../interfaces/task';
import { AuthService } from '../../../services/auth/auth.service';
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
	cdr = inject(ChangeDetectorRef);
	dbService = inject(DbService);
	authService = inject(AuthService);

	async ngOnInit() {}
}
