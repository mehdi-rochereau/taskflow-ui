import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';

/**
 * Route resolver that loads a project before activating the project detail route.
 *
 * Prevents the `ProjectDetailComponent` from rendering with missing data by
 * ensuring the project is fully loaded before navigation completes.
 *
 * Behavior:
 * - If the route parameter `id` is missing, empty, fractional, zero, negative
 *   or not a number at all → redirects to `/projects` without calling the API
 * - If the API returns an error (404, 403, 500) → redirects to `/projects`
 * - On success → injects the project into the route data as `data['project']`
 *
 * @example
 * // In app.routes.ts
 * { path: 'projects/:id', resolve: { project: projectResolver } }
 *
 * // In ProjectDetailComponent
 * const project = this.route.snapshot.data['project'] as Project;
 *
 * @see ProjectDetailComponent
 * @see ProjectService
 */
export const projectResolver: ResolveFn<Project> = (route) => {
  const projectService = inject(ProjectService);
  const router = inject(Router);

  const raw = route.paramMap.get('id');
  const id = Number(raw);

  // The raw string is checked before the conversion because Number() is lenient
  // in ways isNaN alone does not catch. Number(null) and Number('') both yield 0,
  // so a missing or empty parameter used to pass the guard and reach the API as
  // getProjectById(0). Number('1.5') yields 1.5, which is not an identifier
  // either. Number.isInteger rejects both NaN and fractions, and the positivity
  // check rejects the zero that an absent parameter produces.
  if (!raw || !Number.isInteger(id) || id <= 0) {
    router.navigate(['/projects']);
    return EMPTY;
  }

  return projectService.getProjectById(id).pipe(
    catchError(() => {
      router.navigate(['/projects']);
      return EMPTY;
    }),
  );
};
