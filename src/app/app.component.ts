import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, map, of } from 'rxjs';
import { CookiesService } from './cookies.service';
import { AppState } from './store/app.interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'wingsearch'
  public displayConsent = false
  public localizedResources$: Observable<{[key: string]: string}> = of({})

  constructor(private cookies: CookiesService, private store: Store<{ app: AppState }>,
    registry: MatIconRegistry, sanitizer: DomSanitizer) {
    registry.addSvgIcon('externalLink', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/external-link.svg'))
    this.localizedResources$ = store.select(({ app }) => app.translatedContent)
      .pipe(map(translatedContent => 
        Object.entries(translatedContent).reduce((acc, val) => ({ 
          ...acc, 
          [val[0]]: val[1].Translated || val[1]['English name'] || ''
        }), {})));
  }

  ngOnInit(): void {
    if (!this.cookies.getCookie('consent'))
      this.displayConsent = true
  }

  onConsentChange() {
    this.displayConsent = false
  }
}
