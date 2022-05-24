import { isNativeElement } from '../type-guards/is-native-element';

describe('isNativeElement: Environments without HTMLElement type definition', () => {
  beforeEach(() => {
    window.HTMLElement = undefined!;
  });

  it('should return true for an object with shape { nodeType: 1, nodeName: string }', () => {
    // arrange
    const value: Partial<HTMLElement> = {
      nodeType: 1,
      nodeName: 'some-tag',
    };

    // act, assert
    expect(isNativeElement(value)).toEqual(true);
  });

  it('should return false for { nodeType != 1, nodeName: string }', () => {
    // arrange
    const value: Partial<HTMLElement> = {
      nodeType: 0,
      nodeName: 'some-tag',
    };

    // act
    window.HTMLElement = undefined!;

    // assert
    expect(isNativeElement(value)).toEqual(false);
  });

  it('should return false for { nodeType: 1, nodeName: undefined }', () => {
    // arrange
    const value: Partial<HTMLElement> = {
      nodeType: 1,
    };

    // act
    window.HTMLElement = undefined!;

    // assert
    expect(isNativeElement(value)).toEqual(false);
  });
});

describe('isNativeElement: Environments with HTMLElement type definition', () => {
  it('should return true for an HTMLElement in environments having this type definition', () => {
    // arrange
    const value = document.createElement('div');

    // act, assert
    expect(isNativeElement(value)).toEqual(true);
  });

  it('should return false for object being no instance of HTMLElement', () => {
    // arrange
    class FakeElement {}
    const value = new FakeElement();

    // act, assert
    expect(isNativeElement(value)).toEqual(false);
  });
});
