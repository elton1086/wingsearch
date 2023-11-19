import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { Store } from '@ngrx/store'
import { search, bonusCardSearch, changeLanguage, resetLanguage } from '../store/app.actions'
import { AppState, BonusCard, Expansion } from '../store/app.interfaces'
import { Observable } from 'rxjs'
import { Options } from '@angular-slider/ngx-slider'
import { UntypedFormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { CookiesService } from '../cookies.service'
import { MatDialog } from '@angular/material/dialog'
import { LanguageDialogComponent } from './language-dialog/language-dialog.component'
import { AnalyticsService } from '../analytics.service'
import { getAllFlagValues, hasFlag } from '../utils/enum-functions'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Input() localizedResources: {[key: string]: string} = {}

  readonly supportedLanguages = [
    { value: 'en', display: 'English' },
    { value: 'nl', display: 'Nederlands' },
    { value: 'fr', display: 'Français' },
    { value: 'de', display: 'Deutsch' },
    { value: 'pl', display: 'Polski' },
    { value: 'es', display: 'Español' },
    { value: 'tr', display: 'Türkçe' },
    { value: 'uk', display: 'українська' },
    { value: 'pt', display: 'Português' },
  ]

  readonly supportedExpansions = [
    { value: 'asia', display: 'Asia' },
    { value: 'oceania', display: 'Oceania expansion' },
    { value: 'european', display: 'European expansion' },
    { value: 'swiftstart', display: 'Swift-start pack' },
    { value: 'originalcore', display: 'Base game' },
  ]

  query = {
    main: '',
    bonus: [],
    stats: {
      habitat: {
        forest: true,
        grassland: true,
        wetland: true
      },
      birds: true,
      bonuses: true
    },
    expansion: Expansion.all,
    eggs: {
      min: 0,
      max: 6
    },
    points: {
      min: 0,
      max: 9
    },
    wingspan: {
      min: 0,
      max: 500
    },
    foodCost: {
      min: 0,
      max: 3
    },
    colors: {
      brown: true,
      pink: true,
      white: true,
      teal: true,
      yellow: true
    },
    food: {
      invertebrate: false,
      seed: false,
      fruit: false,
      fish: false,
      rodent: false,
      nectar: false,
      'no-food': false,
      'wild (food)': false
    },
    nest: {
      Bowl: true,
      Cavity: true,
      Ground: true,
      None: true,
      Platform: true,
      Wild: true
    },
    beak: {
      left: true,
      right: true
    }
  }

  bonusControl = new UntypedFormControl()

  filteredBonusCards: Observable<BonusCard[]>
  bonusCards: Observable<BonusCard[]>

  canFitStats: boolean

  eggOptions: Options = {
    showTicksValues: true,
    stepsArray: Array.from(Array(7).keys()).map(key => ({ value: key }))
  }

  pointOptions: Options = {
    showTicksValues: true,
    stepsArray: Array.from(Array(10).keys()).map(key => ({ value: key }))
  }

  wingspanOptions: Options = {
    showTicksValues: true,
    stepsArray: [0, 30, 40, 50, 65, 75, 100, 500].map(key => ({ value: key })),
    translate: value => {
      if (value === 0) { return 'min'; }
      else if (value === 500) { return 'max'; }
      else { return value.toString(); }
    }
  }

  foodCostOptions: Options = {
    showTicksValues: true,
    stepsArray: Array.from(Array(4).keys()).map(key => ({ value: key })),
  }

  eggs = {
    min: 0,
    max: 6
  }

  points = {
    min: 0,
    max: 9
  }

  wingspan = {
    min: 0,
    max: 500
  }

  foodCost = {
    min: 0,
    max: 3
  }

  language = 'en'
  selectedExpansions = getAllFlagValues(Expansion.all, (n) => Expansion[n])

  @ViewChild(MatAutocompleteTrigger)
  autocomplete: MatAutocompleteTrigger

  get hasTealPower(): boolean {
    return hasFlag(this.query.expansion, Expansion.european) || hasFlag(this.query.expansion, Expansion.asia);
  }

  get hasYellowPower(): boolean {
    return hasFlag(this.query.expansion, Expansion.oceania) || hasFlag(this.query.expansion, Expansion.asia);
  }

  get hasNectarFood(): boolean {
    return hasFlag(this.query.expansion, Expansion.oceania) || hasFlag(this.query.expansion, Expansion.asia);
  }

  constructor(
    private store: Store<{ app: AppState }>,
    private cookies: CookiesService,
    public dialog: MatDialog,
    private analytics: AnalyticsService
  ) {
    this.filteredBonusCards = this.store.select(({ app }) => app.activeBonusCards)
    this.bonusCards = this.store.select(({ app }) => app.bonusCards)
    const expansionCookie = parseInt(cookies.getCookie('expansion'))
    this.query = {
      ...this.query,
      expansion: isNaN(expansionCookie) ? Expansion.all : expansionCookie
    }
    this.selectedExpansions = getAllFlagValues(this.query.expansion, (n) => Expansion[n])
    store.dispatch(search(this.query))
  }

  ngOnInit(): void {
    this.canFitStats = window.innerWidth >= 600
    this.bonusControl.valueChanges.subscribe(() => this.onBonusChange())
    if (this.cookies.hasConsent())
      this.language = this.cookies.getCookie('language') || this.language
  }

  onQueryChange() {
    this.store.dispatch(search(this.query))
  }

  onBonusChange() {
    this.store.dispatch(bonusCardSearch({ bonus: this.query.bonus, bonusfield: this.bonusControl.value, expansion: this.query.expansion }))
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.stopPropagation()
    }
  }

  onResize() {
    this.canFitStats = window.innerWidth >= 600
  }

  onStatsChange(stats) {
    this.query.stats = stats
    this.onQueryChange()
  }

  clearFilter() {
    this.eggs = { min: 0, max: 6 }
    this.points = { min: 0, max: 9 }
    this.wingspan = { min: 0, max: 500 }
    this.foodCost = { min: 0, max: 3 }
    this.query = {
      ...this.query,
      main: '',
      bonus: [],
      stats: {
        habitat: { forest: true, grassland: true, wetland: true },
        birds: true,
        bonuses: true
      },
      eggs: { ...this.eggs },
      points: { ...this.points },
      wingspan: { ...this.wingspan },
      foodCost: { ...this.foodCost },
      colors: { brown: true, pink: true, white: true, teal: true, yellow: true },
      food: { invertebrate: false, seed: false, fruit: false, fish: false, rodent: false, nectar: false, 'wild (food)': false, 'no-food': false },
      nest: { Bowl: true, Cavity: true, Ground: true, None: true, Platform: true, Wild: true },
      beak: { left: true, right: true }
    }
    this.bonusControl.setValue('')
    this.onBonusChange()
    this.onQueryChange()
  }

  onEggsChange() {
    this.query = { ...this.query, eggs: { ...this.eggs } }
    this.onQueryChange()
  }

  onPointsChange() {
    this.query = { ...this.query, points: { ...this.points } }
    this.onQueryChange()
  }

  onWingspanChange() {
    this.query = { ...this.query, wingspan: { ...this.wingspan } }
    this.onQueryChange()
  }

  onFoodCostChange() {
    this.query = { ...this.query, foodCost: { ...this.foodCost } }
    this.onQueryChange()
  }

  addBonus(event: MatAutocompleteSelectedEvent) {
    this.query = { ...this.query, bonus: [...this.query.bonus, event.option.value] }
    this.bonusControl.setValue('')
    this.onBonusChange()
    this.onQueryChange()
  }

  removeBonus(bonus: number) {
    this.query = { ...this.query, bonus: this.query.bonus.filter(id => id !== bonus) }
    this.onBonusChange()
    this.onQueryChange()
  }

  openPanel() {
    this.autocomplete.openPanel()
  }

  togglePower(color: string) {
    this.query = { ...this.query, colors: { ...this.query.colors, [color]: !this.query.colors[color] } }
    this.onQueryChange()
  }

  toggleFood(food: string) {
    this.query = { ...this.query, food: { ...this.query.food, [food]: !this.query.food[food] } }
    this.onQueryChange()
  }

  toggleNest(nest: string) {
    this.query = { ...this.query, nest: { ...this.query.nest, [nest]: !this.query.nest[nest] } }
    this.onQueryChange()
  }

  toggleBeak(beak: string) {
    this.query = { ...this.query, beak: { ...this.query.beak, [beak]: !this.query.beak[beak] } }
    this.onQueryChange()
  }

  languageChange(language: string) {
    if (language === 'en') {
      this.cookies.deleteCookie('language')
      this.store.dispatch(resetLanguage({ expansion: this.query.expansion }))
    } else {
      this.cookies.setCookie('language', language, 180)
      this.store.dispatch(changeLanguage({ language: language, expansion: this.query.expansion }))
    }

    this.analytics.setLanguage(language)
  }

  openLanguageDialog() {
    this.dialog.open(LanguageDialogComponent, { closeOnNavigation: true, maxWidth: 'min(700px, 80vw)' })
  }

  expansionChange(selectedExpansions: string[]) {
    this.query = {
      ...this.query,
      // @ts-ignore
      expansion: selectedExpansions.reduce((acc, val) => acc |= Expansion[val], Expansion.none)
    }
    this.cookies.setCookie('expansion', this.query.expansion.toString(), 365)
    this.onBonusChange()
    this.onQueryChange()
  }
}
