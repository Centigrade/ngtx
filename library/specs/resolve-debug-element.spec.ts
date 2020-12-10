import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as findFeature from '../features/find';
import { resolveDebugElement } from '../utility';

@Component({})
class CompA {}

@Component({})
class CompB {}

describe('resolveDebugElement', () => {
  let component: CompA;
  let fixture: ComponentFixture<CompA>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompA, CompB],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should return the same debugElement if a debugElement was given', () => {
    // arrange, act, assert
    expect(resolveDebugElement(fixture.debugElement, undefined)).toBe(
      fixture.debugElement,
    );
  });

  it('should call ngtx find implementation if input is of type string', () => {
    // arrange
    const fixture: any = {};
    spyOn(findFeature, 'findImpl');
    const queryTarget = 'string';

    // act
    resolveDebugElement(queryTarget, fixture);

    // assert
    expect(findFeature.findImpl).toHaveBeenCalledTimes(1);
    expect(findFeature.findImpl).toHaveBeenCalledWith(fixture, queryTarget);
  });

  // FindBehaviorTest.test1();
  // FindBehaviorTest.test2();
});
