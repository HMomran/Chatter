import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CustomerSignIn } from './customer-sign-in';
import { Session } from '../../services/session';
describe('CustomerSignIn', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [CustomerSignIn],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
  }));
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.inject(Session).user = null; });
  it('stores the returned account and navigates after successful sign-in', () => {
    const fixture = TestBed.createComponent(CustomerSignIn); fixture.detectChanges();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.form.setValue({ phone: '11111111', password: 'test-password' });
    fixture.componentInstance.onSubmit();
    const user = { _id: 'alice-id', name: 'Alice & A', phone: '111' };
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/customers/login').flush({ customer: user, token: 'test-token' });
    expect(TestBed.inject(Session).user).toEqual(user);
    expect(navigate).toHaveBeenCalledWith(['/UsersPage']);
  });
  it('shows an error when the backend is unavailable', () => {
    const fixture = TestBed.createComponent(CustomerSignIn); fixture.detectChanges();
    fixture.componentInstance.form.setValue({ phone: '11111111', password: 'test-password' }); fixture.componentInstance.onSubmit();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/customers/login').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(fixture.componentInstance.error).toContain('Cannot connect');
  });
});
