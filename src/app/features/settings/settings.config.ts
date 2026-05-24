import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideSettings(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
