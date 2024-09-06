import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreLoginPageComponent } from './pre-login-page.component';

describe('PreLoginPageComponent', () => {
  let component: PreLoginPageComponent;
  let fixture: ComponentFixture<PreLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreLoginPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
