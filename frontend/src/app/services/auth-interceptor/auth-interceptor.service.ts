import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
	router = inject(Router);
	constructor() {}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = localStorage.getItem('token');
		if (token) {
			req = req.clone({
				headers: req.headers.append('Authorization', `Token ${token}`),
			});
		}
		return next.handle(req).pipe(
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					if (err.status === 401) {
						this.router.navigateByUrl('');
					}
				}
				return throwError(() => err);
			}),
		);
	}
}
