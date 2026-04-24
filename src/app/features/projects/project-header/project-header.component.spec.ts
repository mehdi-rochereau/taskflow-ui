import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHeaderComponent } from './project-header.component';

describe('ProjectHeaderComponent', () => {
  let component: ProjectHeaderComponent;
  let fixture: ComponentFixture<ProjectHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
