import createStringList, { createCapitalStringList } from './create-string-list';

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
    const items = ['Apple', 'Pear', 'Berry'];
    expect(createStringList(items)).toEqual('Apple, Pear and Berry');
    expect(createCapitalStringList(items)).toEqual('Apple, pear and berry');
    expect(createStringList(items, ' and ', ' and ')).toEqual('Apple and Pear and Berry');
    expect(createStringList(items, ', ', ' & ')).toEqual('Apple, Pear & Berry');
    expect(createStringList(items, '-', '*')).toEqual('Apple-Pear*Berry');
  });
});
