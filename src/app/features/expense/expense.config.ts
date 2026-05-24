import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideExpense(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
