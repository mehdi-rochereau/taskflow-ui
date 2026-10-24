import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import { ProjectListComponent } from './project-list.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { environment } from '../../../../environments/environment';

/**
 * Covers the loading cycle, the three empty states and the client-side filter.
 *
 * The dialog flows are deliberately left out. They orchestrate two other
 * components, and testing them here would measure those components rather than
 * this one. MatDialog is stubbed only so the injector resolves.
 */
describe('ProjectListComponent', () => {
  let fixture: ComponentFixture<ProjectListComponent>;
  let loader: HarnessLoader;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const projectsUrl = `${environment.apiUrl}/projects`;

  const notification = { success: vi.fn(), error: vi.fn() };
  const dialog = { open: vi.fn() };

  const project = (id: number, name: string): Project => ({
    id,
    name,
    description: null,
    ownerUsername: 'mehdi',
    createdAt: '2026-10-24T15:00:00Z',
  });

  const task = (id: number, status: Task['status']): Task => ({
    id,
    title: `Task ${id}`,
    description: null,
    status,
    priority: 'MEDIUM',
    dueDate: null,
    projectId: 1,
    assigneeUsername: null,
    createdAt: '2026-10-24T15:00:00Z',
  });

  /** Runs ngOnInit, answers the projects call, then answers one task call per project. */
  const load = (projects: Project[], tasks: Record<number, Task[]> = {}) => {
    fixture.detectChanges();
    httpMock.expectOne(projectsUrl).flush(projects);

    projects.forEach((p) => {
      httpMock.expectOne(`${projectsUrl}/${p.id}/tasks`).flush(tasks[p.id] ?? []);
    });

    fixture.detectChanges();
  };

  beforeEach(async () => {
    notification.error.mockClear();
    dialog.open.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NotificationService, useValue: notification },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    TestBed.inject(MatIconRegistry).addSvgIconResolver((name) =>
      TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
    );

    fixture = TestBed.createComponent(ProjectListComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    // match() already removes these from the set verify() inspects, so the
    // flush is only there for fidelity. It is skipped when the request was
    // cancelled: a mat-icon destroyed by a re-render unsubscribes from the
    // registry, which cancels the request, and flushing a cancelled request
    // throws. The exception would then abort the TestBed reset and fail the
    // following test for an unrelated reason.
    httpMock
      .match((req) => req.url.endsWith('.svg'))
      .forEach((req) => {
        if (!req.cancelled) req.flush('<svg></svg>');
      });
    httpMock.verify();
  });

  it('shows the spinner while the projects are loading', () => {
    // ngOnInit runs on the first change detection, and ProjectService raises
    // isLoading in the method body, so the spinner is already up here.
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();

    httpMock.expectOne(projectsUrl).flush([]);
  });

  it('renders one card per project once loaded', () => {
    load([project(1, 'TaskFlow'), project(2, 'Bastion')]);

    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('TaskFlow');
    expect(fixture.nativeElement.textContent).toContain('Bastion');
  });

  it('shows the first-project empty state when the list comes back empty', () => {
    // No task calls follow, because loadTaskCounts returns early on an empty
    // list. forkJoin of an empty array completes without ever emitting, so that
    // early return is what keeps the map from going stale.
    load([]);

    expect(fixture.nativeElement.textContent).toContain('No projects yet');
  });

  it('filters the cards by the search query', async () => {
    load([project(1, 'TaskFlow'), project(2, 'Bastion')]);

    const search = await loader.getHarness(MatInputHarness);
    await search.setValue('task');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('TaskFlow');
  });

  it('shows the no-results state when the query matches nothing', async () => {
    load([project(1, 'TaskFlow')]);

    const search = await loader.getHarness(MatInputHarness);
    await search.setValue('nothing');
    fixture.detectChanges();

    // The order of the template branches matters here. This state is reached
    // only because the filtered-and-searching case is tested before the
    // no-projects case, which would otherwise swallow it.
    expect(fixture.nativeElement.textContent).toContain('No results found');
    expect(fixture.nativeElement.textContent).not.toContain('No projects yet');
  });

  it('derives the task counts and the progress bar from the loaded tasks', async () => {
    load([project(1, 'TaskFlow')], { 1: [task(1, 'DONE'), task(2, 'TODO')] });

    expect(fixture.nativeElement.textContent).toContain('1/2 tasks done');

    const bar = await loader.getHarness(MatProgressBarHarness);
    expect(await bar.getValue()).toBe(50);
  });

  it('navigates to the detail page when a card is clicked', () => {
    load([project(7, 'TaskFlow')]);

    fixture.nativeElement.querySelector('.project-card').click();

    expect(navigate).toHaveBeenCalledWith(['/projects', 7]);
  });

  it('notifies when the projects fail to load', () => {
    fixture.detectChanges();
    httpMock.expectOne(projectsUrl).flush('', { status: 500, statusText: 'Internal Server Error' });

    expect(notification.error).toHaveBeenCalledWith('Failed to load projects');
  });
});
