jest.mock('chalk', () => {
  return { hex: jest.fn().mockReturnValue((v: string) => v) };
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { hex } from 'chalk';
import { initSyntaxHighlighting } from '..';
import { debugImpl } from '../features/debug';

@Component({
  template: '<div></div>',
})
class DemoComponent {}

describe('init-features: initSyntaxHighlighting', () => {
  let fixture: ComponentFixture<DemoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DemoComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoComponent);
  });

  it('should use a mock when syntax highlighting is not initialized', async () => {
    // arrange, act, assert
    expect(() => debugImpl(fixture)).not.toThrow();
  });

  it('should use chalk for syntax highlighting, when initialized', async () => {
    // arrange
    await initSyntaxHighlighting();

    // act, assert
    expect(() => debugImpl(fixture)).not.toThrow();
    expect(hex).toHaveBeenCalled();
  });
});
