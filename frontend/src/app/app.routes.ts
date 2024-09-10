import { Routes } from '@angular/router';
import { LoginComponent } from './components/pre_login/login/login.component';
import { PreLoginPageComponent } from './components/pre_login/pre-login-page/pre-login-page.component';
import { SignupComponent } from './components/pre_login/signup/signup.component';
import { LegalComponent } from './components/shared/legal/legal.component';
import { PrivacyComponent } from './components/shared/privacy/privacy.component';
import { PostLoginPageComponent } from './components/post_login/post-login-page/post-login-page.component';
import { DashboardComponent } from './components/post_login/dashboard/dashboard.component';
import { BoardComponent } from './components/post_login/board/board.component';
import { AddTaskComponent } from './components/post_login/add-task/add-task.component';
import { ContactsComponent } from './components/post_login/contacts/contacts.component';
import { HelpComponent } from './components/post_login/help/help.component';

export const routes: Routes = [
	{
		path: '',
		component: PreLoginPageComponent,
		children: [
			{ path: '', component: LoginComponent },
			{ path: 'signup', component: SignupComponent },
		],
	},

	{
		path: 'home',
		component: PostLoginPageComponent,
		children: [
			{ path: '', component: DashboardComponent },
			{ path: 'board', component: BoardComponent },
			{ path: 'add-task', component: AddTaskComponent },
			{ path: 'contacts', component: ContactsComponent },
			{ path: 'help', component: HelpComponent },
		],
	},

	{ path: 'legal', component: LegalComponent },
	{ path: 'privacy', component: PrivacyComponent },
];
