import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';

export const projectResolver: ResolveFn<Project> = (route) => {
  const projectService = inject(ProjectService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return projectService.getProjectById(id).pipe(
    catchError(() => {
      router.navigate(['/projects']);
      return EMPTY;
    }),
  );
};
