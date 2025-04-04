import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { restaurantResolver } from './restaurant.resolver';

describe('restaurantResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => restaurantResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
