import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CustomerSignUp } from './customer-sign-up';
import { Session } from '../../services/session';
describe('CustomerSignUp', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CustomerSignUp], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }));
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.inject(Session).user = null; });
  it('rejects mismatched passwords without sending a request', () => {
    const fixture = TestBed.createComponent(CustomerSignUp); fixture.detectChanges();
    fixture.componentInstance.form.setValue({ name: 'Alice', phone: '11111111', password: 'password-one', confirmPassword: 'password-two' });
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error).toContain('do not match');
    TestBed.inject(HttpTestingController).expectNone('http://localhost:3000/api/customers');
  });
  it('creates an account and starts its session', () => {
    const fixture = TestBed.createComponent(CustomerSignUp); fixture.detectChanges();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.form.setValue({ name: 'Alice', phone: '11111111', password: 'password-one', confirmPassword: 'password-one' });
    fixture.componentInstance.onSubmit();
    const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/customers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.password).toBe('password-one');
    request.flush({ customer: { _id: 'alice', name: 'Alice', phone: '11111111' }, token: 'alice-token' });
    expect(TestBed.inject(Session).token).toBe('alice-token');
    expect(navigate).toHaveBeenCalledWith(['/UsersPage']);
  });
});
