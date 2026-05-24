import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
