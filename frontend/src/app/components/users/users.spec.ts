import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';
import { Session } from '../../services/session';

describe('People directory', () => {
  let fixture: ComponentFixture<Users>;
  let http: HttpTestingController;
  const alice = { _id: 'alice', name: 'Alice', phone: '11111111' };
  const bob = { _id: 'bob', name: 'Bob Smith', phone: '22222222' };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])], imports: [Users]
    }).compileComponents();
    TestBed.inject(Session).save({ customer: alice, token: 'test-token' });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
  });
  afterEach(() => { http.verify(); TestBed.inject(Session).user = null; });
  it('shows loading, excludes the current account, and announces refresh success', () => {
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.skeleton-grid')).toBeTruthy();
    http.expectOne('http://localhost:3000/api/customers').flush([alice, bob]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.person-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Directory up to date');
    expect(fixture.nativeElement.querySelector('.person-card').getAttribute('aria-label')).toContain('Bob Smith');
  });
  it('filters names and phone numbers and offers a search reset', () => {
    http.expectOne('http://localhost:3000/api/customers').flush([alice, bob]);
    fixture.componentInstance.search = 'bOb'; fixture.detectChanges();
    expect(fixture.componentInstance.filteredUsers).toEqual([bob]);
    fixture.componentInstance.search = '2222'; fixture.detectChanges();
    expect(fixture.componentInstance.filteredUsers).toEqual([bob]);
    fixture.componentInstance.search = 'nobody'; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state h2').textContent).toContain('No people found');
    fixture.nativeElement.querySelector('.empty-state button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.person-card')).toBeTruthy();
  });
  it('shows an actionable error and allows retry', () => {
    http.expectOne('http://localhost:3000/api/customers').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    fixture.nativeElement.querySelector('.directory-error button').click();
    http.expectOne('http://localhost:3000/api/customers').flush([]); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty-state h2').textContent).toContain('Your next conversation');
  });
  it('keeps the directory within mobile, tablet and desktop widths', () => {
    http.expectOne('http://localhost:3000/api/customers').flush([bob, { _id: 'long', name: 'A very long account name that should wrap without widening the page', phone: '+973123456789' }]);
    fixture.detectChanges();
    const styles = Array.from(document.styleSheets).map(sheet => {
      try { return Array.from(sheet.cssRules).filter(rule => rule.type !== CSSRule.IMPORT_RULE).map(rule => rule.cssText).join('\n'); }
      catch { return ''; }
    }).join('\n');
    const frame = document.createElement('iframe');
    frame.style.cssText = 'border:0;height:1000px;position:absolute;left:0;top:0;';
    document.body.appendChild(frame);
    try {
      const doc = frame.contentDocument!;
      doc.open(); doc.write(`<html><head><style>${styles}</style></head><body>${fixture.nativeElement.outerHTML}</body></html>`); doc.close();
      for (const width of [360, 768, 1440]) {
        frame.style.width = `${width}px`;
        const root = doc.querySelector('.workspace') as HTMLElement;
        expect(root.getBoundingClientRect().width).withContext(`workspace at ${width}px`).toBeLessThanOrEqual(width);
        expect(doc.documentElement.scrollWidth).withContext(`overflow at ${width}px`).toBeLessThanOrEqual(width);
        const button = doc.querySelector('.person-card') as HTMLElement;
        expect(button.getBoundingClientRect().width).toBeGreaterThan(100);
      }
      const button = doc.querySelector('.person-card') as HTMLElement;
      button.focus();
      expect(doc.activeElement).toBe(button);
    } finally { frame.remove(); }
  });

});
