import { expandValueToArrayWithLength } from '../declarative-testing/utility';

describe('expandValueToArrayWithLength', () => {
  it('should return the original value if it is an array of the desired length', () => {
    expect(expandValueToArrayWithLength(3, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should return an array filled with copies of the original value if it is no array', () => {
    expect(expandValueToArrayWithLength(3, 42)).toEqual([42, 42, 42]);
  });

  it('should throw if the value is an array with more items than requested', () => {
    expect(() => expandValueToArrayWithLength(3, [1, 2, 3, 4])).toThrow(
      /is greater than/,
    );
  });

  it('should throw if the value is an array with fewer items than requested', () => {
    expect(() => expandValueToArrayWithLength(3, [1, 2])).toThrow(
      /does not match/,
    );
  });
});
