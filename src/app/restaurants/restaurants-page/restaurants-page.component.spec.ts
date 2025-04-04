import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantsPageComponent } from './restaurants-page.component';

describe('RestaurantsPageComponent', () => {
  let component: RestaurantsPageComponent;
  let fixture: ComponentFixture<RestaurantsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
