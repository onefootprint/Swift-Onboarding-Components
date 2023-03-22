import createStringList from './create-string-list';

describe('createStringList', () => {
  it('empty list renders correctly', () => {
    expect(createStringList([])).toEqual('');
  });

  it('list with 1 item renders correctly', () => {
    expect(createStringList(['apple'])).toEqual('Apple');
  });

  it('list with 2 items renders correctly', () => {
    const items = ['apple', 'pear'];
    expect(createStringList(items)).toEqual('Apple and pear');
    expect(createStringList(items, ', ', ' & ')).toEqual('Apple & pear');
  });

  it('list with 2+ items renders correctly', () => {
    const items = ['apple', 'pear', 'berry'];
    expect(createStringList(items)).toEqual('Apple, pear and berry');
    expect(createStringList(items, ' and ', ' and ')).toEqual(
      'Apple and pear and berry',
    );
    expect(createStringList(items, ', ', ' & ')).toEqual('Apple, pear & berry');
    expect(createStringList(items, '-', '*')).toEqual('Apple-pear*berry');
  });
});
