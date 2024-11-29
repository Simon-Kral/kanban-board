# Frontend
This Frontend was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.2.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Backend
This Backend was generated with [Django]([https://github.com/angular/angular-cli](https://www.django-rest-framework.org/)) version 5.1.1.

## Before you start
Python and pip is required to install this project.

## Python Virtual Environment
Create a virtual environment `python -m venv env` in the backend-folder.
Then activate the virtual environment:
- for Windows: `env\Scripts\activate`
- for Linux/MacOS: `source env/bin/activate`

## Requirements
Install the required packages `pip install -r requirements.txt`.

## Setup Database
make and apply the Migrations:
- `python manage.py makemigrations`
- `python manage.py migrate`

## Run the Backend-Server
`python manage.py runserver`

## Optional
Create an admin-user `python manage.py createsuperuser`



Your Backend is now ready to be utilized by the Frontend.
