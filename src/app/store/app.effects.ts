import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects'
import { from, of } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { CookiesService } from '../cookies.service'
import { changeLanguage } from './app.actions'
import { Expansion } from './app.interfaces'

@Injectable()
export class AppEffects {
    readonly I18N_FOLDER = 'assets/data/i18n/'

    loadLanguage$ = createEffect(() => this.actions$.pipe(
        ofType(ROOT_EFFECTS_INIT, changeLanguage),
        mergeMap((action) => {
            const language = action.language || (this.cookies.hasConsent() && this.cookies.getCookie('language'))
            if (language)
            {
              const expansionCookie = parseInt(this.cookies.getCookie('expansion'))
              const expansion = action.expansion || (isNaN(expansionCookie) ? Expansion.all : expansionCookie)
              return from(this.http.get(this.I18N_FOLDER + language + '.json')).pipe(
                map((data) => ({ type: '[App] Set language', payload: data, language: language, expansion: expansion }))
              )
            }
            else
                return of({ type: '[App] English' })
        })
    ))

    constructor(
        private actions$: Actions,
        private cookies: CookiesService,
        private http: HttpClient
    ) { }
}
