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
 * - If the route parameter `id` is not a valid number → redirects to `/projects`
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
  const id = Number(route.paramMap.get('id'));

  if (isNaN(id)) {
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
