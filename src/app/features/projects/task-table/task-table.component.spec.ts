import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskTableComponent } from './task-table.component';
import { Task } from '../../../core/models/task.model';

/**
 * Covers the rendering of a dumb component and the events it emits upward.
 *
 * Inputs are set through componentRef.setInput rather than by assigning the
 * property, because this component uses OnPush: assigning the property directly
 * would change the value without marking the view dirty, and the test would
 * assert against a stale DOM.
 */
describe('TaskTableComponent', () => {
  let fixture: ComponentFixture<TaskTableComponent>;
  let component: TaskTableComponent;
  let httpMock: HttpTestingController;

  const initialWidth = window.innerWidth;

  const task = (id: number, overrides: Partial<Task> = {}): Task => ({
    id,
    title: `Task ${id}`,
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    projectId: 1,
    assigneeUsername: null,
    createdAt: '2026-10-24T15:00:00Z',
    ...overrides,
  });

  /** Sets the three inputs at once and renders. */
  const render = (tasks: Task[], isLoading = false, hasActiveFilter = false) => {
    fixture.componentRef.setInput('tasks', tasks);
    fixture.componentRef.setInput('isLoading', isLoading);
    fixture.componentRef.setInput('hasActiveFilter', hasActiveFilter);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTableComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    TestBed.inject(MatIconRegistry).addSvgIconResolver((name) =>
      TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
    );

    fixture = TestBed.createComponent(TaskTableComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Restored because the constructor reads window.innerWidth. A test that
    // narrowed the window and did not put it back would silently start every
    // later component in mobile mode.
    Object.defineProperty(window, 'innerWidth', { value: initialWidth, configurable: true });

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

  it('renders one row per task', () => {
    render([task(1), task(2), task(3)]);

    expect(fixture.nativeElement.querySelectorAll('mat-row').length).toBe(3);
  });

  it('renders the status and the priority through their pipes', () => {
    render([task(1, { status: 'IN_PROGRESS', priority: 'HIGH' })]);

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(chips[0].textContent.trim()).toBe('In progress');
    expect(chips[1].textContent.trim()).toBe('High');
  });

  it('shows a spinner instead of the table while loading', () => {
    render([], true);

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mat-table')).toBeNull();
  });

  it('shows the no-results state when a filter is active', () => {
    render([], false, true);

    expect(fixture.nativeElement.textContent).toContain('No results found');
    expect(fixture.nativeElement.textContent).not.toContain('No tasks yet');
  });

  it('shows the empty state and emits createTask from its button', () => {
    const emitted = vi.fn();
    component.createTask.subscribe(emitted);

    render([]);
    expect(fixture.nativeElement.textContent).toContain('No tasks yet');

    fixture.nativeElement.querySelector('.empty-state button').click();
    expect(emitted).toHaveBeenCalled();
  });

  it('emits view when a row is clicked', () => {
    const emitted = vi.fn();
    component.view.subscribe(emitted);
    const first = task(1);

    render([first, task(2)]);
    fixture.nativeElement.querySelector('mat-row').click();

    expect(emitted).toHaveBeenCalledWith(first);
  });

  it('emits edit and delete with the originating event', () => {
    const edited = vi.fn();
    const deleted = vi.fn();
    component.edit.subscribe(edited);
    component.delete.subscribe(deleted);
    const first = task(1);

    render([first]);
    const buttons = fixture.nativeElement.querySelectorAll('mat-cell button');

    // The click event travels with the payload so the parent can stop its
    // propagation, which is what keeps the row click from firing as well.
    buttons[1].click();
    expect(edited).toHaveBeenCalledWith({ event: expect.any(Event), task: first });

    buttons[2].click();
    expect(deleted).toHaveBeenCalledWith({ event: expect.any(Event), task: first });
  });

  it('renders the reduced column set on a narrow window', () => {
    render([task(1)]);
    expect(fixture.nativeElement.querySelectorAll('mat-header-cell').length).toBe(5);

    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

    // A second fixture rather than a resize on the first one. The column set is
    // decided in the constructor from the window width, so a fresh instance
    // covers the whole path from width to rendered header. Driving a resize on
    // the existing instance updated the property but never reached the table,
    // for a reason that was not identified. The transition from one width to
    // the other is therefore not covered, and it disappears with the planned
    // move to BreakpointObserver.
    const narrow = TestBed.createComponent(TaskTableComponent);
    narrow.componentRef.setInput('tasks', [task(1)]);
    narrow.detectChanges();

    expect(narrow.componentInstance.displayedColumns).toEqual([
      'title',
      'status',
      'priority',
      'actions',
    ]);
    expect(narrow.nativeElement.querySelectorAll('mat-header-cell').length).toBe(4);
  });
});
