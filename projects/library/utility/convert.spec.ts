import { convert } from './convert';

describe('convert', () => {
  it('should return the original value if no converter is passed', () => {
    // arrange
    const original = 42;

    // act, assert
    expect(convert(original, undefined)).toEqual(original);
  });

  it('should call the converter fn with the value if some is given', () => {
    // arrange
    const original = 42;
    const fakeConverter = jest.fn();

    // act
    convert(original, fakeConverter);

    // assert
    expect(fakeConverter).toHaveBeenCalledTimes(1);
    expect(fakeConverter).toHaveBeenCalledWith(original);
  });
});
