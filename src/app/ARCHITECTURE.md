# Enterprise Angular Architecture Guide

This project uses standalone Angular architecture. There are no NgModules in the app code.

## Folder Purpose

- `core`: Singleton app-wide services, interceptors, state, tokens, guards, constants, and models.
- `shared`: Reusable UI components, pipes, directives, validators, and common Material import references.
- `shell`: The application frame: header, sidebar, footer, layout, and shell-only models.
- `features`: Business pages grouped by domain, such as dashboard, employee, attendance, leave, payroll, and reports.
- `environments`: Environment-specific values such as API base URLs.
- `styles`: SCSS partials can live here as the design system grows.

## Signals vs RxJS

- Use Signals for local UI state, such as sidebar collapsed state, menu expansion, notification count, and page card data.
- Use RxJS for async streams, especially HTTP API calls from `HttpClient`.
- Convert RxJS to Signals only when the template needs to display async values as UI state.

## Routing

`app.routes.ts` loads the shell at the root path. Feature pages are children of the shell.

`loadComponent` makes features lazy-load-ready, so larger HRMS modules can be downloaded only when users open them.

## API Services

`ApiService` centralizes common HTTP methods. Feature services like `EmployeeService` and `AttendanceService` call `ApiService` instead of repeating HTTP code.

Interceptors handle cross-cutting behavior:

- `authInterceptor`: attaches JWT tokens.
- `loadingInterceptor`: updates global loading state.
- `errorInterceptor`: centralizes API error handling.
