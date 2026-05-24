import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideAsset(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
