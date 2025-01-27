import { Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { createExtension } from '../../declarative-testing/declarative-testing';
import { provider } from '../../declarative-testing/lib';
import { ngtx } from '../../ngtx';

@Injectable()
class TestService {
  public subject$ = new BehaviorSubject<boolean>(false);
  public someState = false;
}

export abstract class SomeToken$ extends BehaviorSubject<boolean> {}

@Component({ standalone: false, template: `` })
class TestingComponent {}

describe(
  'provider predicate',
  ngtx<TestingComponent>(({ useFixture, When, host }) => {
    let fixture: ComponentFixture<TestingComponent>;
    const noopAssertion = createExtension(() => {});

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [TestingComponent],
        providers: [
          TestService,
          { provide: SomeToken$, useFactory: () => new BehaviorSubject(false) },
        ],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestingComponent);
      useFixture(fixture);
    });

    it('has(provider.withState)', () => {
      When(host)
        .has(provider(TestService).withState({ someState: true }))
        .expect(host)
        .to(noopAssertion);

      // assert
      expect(TestBed.inject(TestService).someState).toBe(true);
    });

    it('has(provider.emittingOnProperty)', () => {
      // pre-condition
      expect(TestBed.inject(TestService).subject$.value).toBe(false);

      When(host)
        .has(provider(TestService).emittingOnProperty$('subject$', true))
        .expect(host)
        .to(noopAssertion);

      // assert
      expect(TestBed.inject(TestService).subject$.value).toBe(true);
    });

    it('has(provider.emitting)', () => {
      // pre-condition
      expect(TestBed.inject(SomeToken$).value).toBe(false);

      When(host)
        .has(provider(SomeToken$).emitting$(true))
        .expect(host)
        .to(noopAssertion);

      // assert
      expect(TestBed.inject(SomeToken$).value).toBe(true);
    });
  }),
);
