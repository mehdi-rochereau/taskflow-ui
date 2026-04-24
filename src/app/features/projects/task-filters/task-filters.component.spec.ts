import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFiltersComponent } from './task-filters.component';

describe('TaskFiltersComponent', () => {
  let component: TaskFiltersComponent;
  let fixture: ComponentFixture<TaskFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFiltersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
