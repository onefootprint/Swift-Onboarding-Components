import trimAndSplit from './trim-and-split';

describe('trimAndSplit', () => {
  it('should return an empty array for an empty input', () => {
    expect(trimAndSplit('')).toBeUndefined();
  });

  it('should return an empty array for an undefined input', () => {
    expect(trimAndSplit(undefined)).toBeUndefined();
  });

  it('should return an array with the trimmed string when there are no commas', () => {
    expect(trimAndSplit(' abc ')).toEqual(['abc']);
  });

  it('should return an array with trimmed and split values', () => {
    expect(trimAndSplit(' a, b, c ')).toEqual(['a', 'b', 'c']);
  });

  it('should return an array with split values', () => {
    expect(trimAndSplit('a,b,c')).toEqual(['a', 'b', 'c']);
  });
});
