import { Routes } from '@angular/router';
import { LoginComponent } from './components/pre_login/login/login.component';
import { PreLoginComponent } from './components/pre_login/pre-login.component';
import { SignupComponent } from './components/pre_login/signup/signup.component';
import { LegalComponent } from './components/shared/legal/legal.component';
import { PrivacyComponent } from './components/shared/privacy/privacy.component';
import { PostLoginComponent } from './components/post_login/post-login.component';
import { SummaryComponent } from './components/post_login/summary/summary.component';
import { BoardComponent } from './components/post_login/board/board.component';
import { AddTaskComponent } from './components/post_login/add-task/add-task.component';
import { ContactsComponent } from './components/post_login/contacts/contacts.component';
import { HelpComponent } from './components/post_login/help/help.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{
		path: '',
		component: PreLoginComponent,
		children: [
			{ path: 'login', component: LoginComponent },
			{ path: 'signup', component: SignupComponent },
		],
	},
	{ path: 'home', redirectTo: 'home/summary', pathMatch: 'full' },
	{
		path: 'home',
		component: PostLoginComponent,
		children: [
			{ path: 'summary', component: SummaryComponent },
			{ path: 'board', component: BoardComponent },
			{ path: 'add-task', component: AddTaskComponent },
			{ path: 'contacts', component: ContactsComponent },
			{ path: 'help', component: HelpComponent },
			{ path: 'legal', component: LegalComponent },
			{ path: 'privacy', component: PrivacyComponent },
		],
	},
];
