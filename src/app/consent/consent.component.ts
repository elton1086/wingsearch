import { Component, EventEmitter, Output } from '@angular/core'
import { AnalyticsService } from '../analytics.service'
import { CookiesService } from '../cookies.service'

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent {
  @Output()
  consentChange = new EventEmitter<string>()

  constructor(private cookies: CookiesService, private analytics: AnalyticsService) { }

  setConsent(value: string) {
    this.cookies.setCookie('consent', value, 180, true)
    this.consentChange.emit(value)

    if (value === '1')
      this.analytics.setLanguage(this.cookies.getCookie('language') || 'en')
  }
}
