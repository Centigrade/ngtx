jest.mock('chalk', () => {
  return { hex: jest.fn().mockReturnValue((v: string) => v) };
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgtxElement } from '../core';
import { NGTX_GLOBAL_CONFIG, setDefaultSpyFactory } from '../global-config';

@Component({ standalone: false, template: '<div></div>' })
class DemoComponent {}

describe('init-features: initSyntaxHighlighting', () => {
  let fixture: ComponentFixture<DemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DemoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoComponent);
  });

  it('should use a mock when syntax highlighting is not initialized', async () => {
    // arrange
    const element = new NgtxElement(fixture.debugElement);
    // act, assert
    expect(() => element.debug()).not.toThrow();
  });

  it('should set a default spyFactory that can be used by declarative testing api', () => {
    // arrange
    const spyFactory = () => jest.fn();
    // act
    setDefaultSpyFactory(spyFactory);
    // assert
    expect(NGTX_GLOBAL_CONFIG.defaultSpyFactory).toBe(spyFactory);
  });
});
