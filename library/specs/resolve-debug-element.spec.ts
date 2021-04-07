import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { resolveDebugElement } from '../utility';

@Component({
  selector: 'cmp-parent',
  template: `
    <cmp-b></cmp-b>
    <cmp-c></cmp-c>
  `,
})
class ParentComponent {}

@Component({
  selector: 'cmp-b',
  template: 'ComponentB',
})
class CompB {}

@Component({
  selector: 'cmp-c',
  template: 'ComponentC',
})
class CompC {}

describe('resolveDebugElement', () => {
  let component: ParentComponent;
  let fixture: ComponentFixture<ParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ParentComponent, CompB, CompC],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should return the same debugElement if a debugElement was given', () => {
    // arrange, act, assert
    expect(resolveDebugElement(fixture.debugElement, fixture)).toBe(
      fixture.debugElement,
    );
  });

  it.each([
    ['cmp-b', CompB],
    [CompC, CompC],
  ])(
    'should return the correct debugElement for the queryTarget (%s)',
    (queryTarget, expectedType) => {
      // arrange, act
      const debugElement = resolveDebugElement(queryTarget, fixture);

      // assert
      expect(debugElement.componentInstance instanceof expectedType).toBe(true);
    },
  );
});
