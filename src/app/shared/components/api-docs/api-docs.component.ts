import { Component, NO_ERRORS_SCHEMA, OnInit, ElementRef, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

/**
 * Component that renders the TaskFlow API documentation using Redoc.
 *
 * Loads the Redoc standalone bundle from `public/redoc.standalone.js`
 * (served as a static asset) and initializes it with the OpenAPI spec
 * fetched from the API server at `/v3/api-docs`.
 *
 * This approach avoids loading Redoc from an external CDN, which would
 * violate the Content Security Policy (`default-src 'self'`) enforced
 * by the API server.
 *
 * `NO_ERRORS_SCHEMA` is required to allow the `<redoc>` custom HTML element
 * without Angular treating it as an unknown component.
 *
 * Accessible at `/api-docs` — no authentication required.
 *
 * @see environment.apiBaseUrl
 */
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

  /** URL of the OpenAPI spec served by the TaskFlow API. */
  readonly specUrl = `${environment.apiBaseUrl}/v3/api-docs`;

  /**
   * Dynamically loads the Redoc standalone script and initializes
   * the documentation viewer with the OpenAPI spec URL.
   */
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
