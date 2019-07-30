import { enableProdMode, ComponentRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableDebugTools } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { RootComponent } from './app/components/root/root.component';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
.then(appRef => {
  // it's a lie... appRef is a NgModuleRef instance
  enableDebugTools(appRef as unknown as ComponentRef<RootComponent>);
})
  .catch(err => console.error(err));
