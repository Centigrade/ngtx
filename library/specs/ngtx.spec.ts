import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { haveText, state } from '../declarative-testing/lib';
import { ngtx } from '../ngtx';

@Component({
  template: '<div> {{ text }} </div>',
})
class TestComponent {
  public text = '';
}

describe(
  'ngtx',
  ngtx<TestComponent>(({ useFixture }, { When, host, get, getAll }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [TestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(TestComponent);
      useFixture(fixture);
    });

    class the {
      static Text() {
        return get('div');
      }
      static Texts() {
        return getAll('div');
      }
    }

    it('[the second ngtx reference] should also work (get)', () => {
      When(host)
        .has(state({ text: 'hello' }))
        .expect(the.Text)
        .to(haveText('hello'));
    });

    it('[the second ngtx reference] should also work (getAll)', () => {
      When(host)
        .has(state({ text: 'hello' }))
        .expect(the.Texts)
        .to(haveText('hello'));
    });
  }),
);
