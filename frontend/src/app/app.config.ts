import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { API_BASE_URL } from './services/api-client.generated';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    provideTranslateService({
      defaultLanguage: 'th',
    }),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
    }),
  ],
};
