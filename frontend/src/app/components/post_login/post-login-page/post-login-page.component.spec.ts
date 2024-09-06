import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostLoginPageComponent } from './post-login-page.component';

describe('PostLoginPageComponent', () => {
  let component: PostLoginPageComponent;
  let fixture: ComponentFixture<PostLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostLoginPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
