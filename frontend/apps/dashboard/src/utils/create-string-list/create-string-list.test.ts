import createStringList from './create-string-list';

describe('createStringList', () => {
  it('empty list renders correctly', () => {
    expect(createStringList([])).toEqual('');
  });

  it('list with 1 item renders correctly', () => {
    expect(createStringList(['apple'])).toEqual('apple');
  });

  it('list with 2 items renders correctly', () => {
    const items = ['apple', 'pear'];
    expect(createStringList(items)).toEqual('apple and pear');
    expect(createStringList(items, ', ', ' & ')).toEqual('apple & pear');
  });

  it('list with 2+ items renders correctly', () => {
    const items = ['apple', 'pear', 'berry'];
    expect(createStringList(items)).toEqual('apple, pear, and berry');
    expect(createStringList(items, ' and ', ' and ')).toEqual(
      'apple and pear and berry',
    );
    expect(createStringList(items, ', ', ' & ')).toEqual('apple, pear & berry');
    expect(createStringList(items, '-', '*')).toEqual('apple-pear*berry');
  });
});
