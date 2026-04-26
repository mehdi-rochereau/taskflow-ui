import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly githubUrl = 'https://github.com/mehdi-rochereau';
  readonly linkedinUrl = 'https://www.linkedin.com/in/mehdi-rochereau/';
  readonly swaggerUrl = environment.swaggerUrl;
  readonly redocUrl = environment.redocUrl;
}
