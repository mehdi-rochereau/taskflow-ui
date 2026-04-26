import { Component, NO_ERRORS_SCHEMA, OnInit, ElementRef, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './api-docs.component.html',
  styleUrl: './api-docs.component.scss',
})
export class ApiDocsComponent implements OnInit {
  private readonly el = inject(ElementRef);
  readonly specUrl = `${environment.apiBaseUrl}/v3/api-docs`;

  ngOnInit(): void {
    const script = document.createElement('script');
    script.src = 'redoc.standalone.js';
    script.onload = () => {
      (window as any)['Redoc'].init(
        this.specUrl,
        {},
        this.el.nativeElement.querySelector('#redoc-container'),
      );
    };
    document.head.appendChild(script);
  }
}
