import { Pipe, PipeTransform } from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState, TranslatedContent } from './store/app.interfaces'

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  private translatedContent: {
    [key: string]: TranslatedContent
  }

  transform(id: string): string {
    return this.translatedContent[id]?.Translated ?? this.translatedContent[id]?.['English name'] ?? id;
  }

  constructor(private store: Store<{ app: AppState }>) {
    store.select(({ app }) => app.translatedContent)
      .subscribe(translatedContent => {
        this.translatedContent = translatedContent;
      });
  }
}
