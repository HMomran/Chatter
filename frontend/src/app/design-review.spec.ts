import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FirstPage } from './components/first-page/first-page';
import { CustomerSignIn } from './components/customer-sign-in/customer-sign-in';
import { CustomerSignUp } from './components/customer-sign-up/customer-sign-up';
import { Users } from './components/users/users';
import { ChatPage } from './components/chat-page/chat-page';
import { ChatService } from './services/socket-chat';
import { Session } from './services/session';

describe('Rendered design review', () => {
  const peer = { _id: 'peer', name: 'A long contact name that should wrap without breaking the layout', phone: '+973123456789' };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstPage, CustomerSignIn, CustomerSignUp, Users, ChatPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ receiverId: peer._id, receiverName: peer.name }) } } },
        { provide: ChatService, useValue: { join() {}, receiveMessages: () => of(), sendMessage() {} } }]
    }).compileComponents();
    TestBed.inject(Session).save({ customer: { _id: 'me', name: 'Current person', phone: '11111111' }, token: 'test' });
  });
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.inject(Session).user = null; });
  for (const component of [FirstPage, CustomerSignIn, CustomerSignUp, Users, ChatPage]) {
    it(`${component.name} fits mobile, tablet and desktop without horizontal overflow`, () => {
      const fixture = TestBed.createComponent(component as typeof FirstPage);
      fixture.detectChanges();
      const http = TestBed.inject(HttpTestingController);
      if (component === Users) http.expectOne('http://localhost:3000/api/customers').flush([peer]);
      if (component === ChatPage) http.expectOne('http://localhost:3000/api/messages/customers/me?peer=peer').flush([
        { _id: '1', sender: 'peer', receiver: 'me', message: 'A message with a long link: https://example.com/' + 'a'.repeat(100), timestamp: new Date().toISOString() },
        { _id: '2', sender: 'me', receiver: 'peer', message: 'Reply received.', timestamp: new Date().toISOString() }
      ]);
      fixture.detectChanges();
      const styles = Array.from(document.styleSheets).map(sheet => {
        try { return Array.from(sheet.cssRules).filter(rule => rule.type !== CSSRule.IMPORT_RULE).map(rule => rule.cssText).join('\n'); } catch { return ''; }
      }).join('\n');
      const frame = document.createElement('iframe');
      frame.style.cssText = 'border:0;height:900px;position:absolute;top:0;left:0'; document.body.appendChild(frame);
      try {
        const doc = frame.contentDocument!;
        doc.open(); doc.write(`<html><head><style>${styles}</style></head><body>${fixture.nativeElement.outerHTML}</body></html>`); doc.close();
        for (const width of [320, 360, 768, 1440]) {
          frame.style.width = `${width}px`;
          expect(doc.documentElement.scrollWidth).withContext(`${component.name} at ${width}px`).toBeLessThanOrEqual(width);
          for (const input of Array.from(doc.querySelectorAll('input'))) {
            expect(input.getBoundingClientRect().width).withContext('usable input width').toBeGreaterThan(100);
          }
        }
        const target = doc.querySelector('button, a') as HTMLElement;
        target.focus(); expect(doc.activeElement).toBe(target);
      } finally { frame.remove(); }
      fixture.destroy();
    });
  }
});
