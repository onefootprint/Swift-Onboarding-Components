import { describe, expect, it } from 'bun:test';

import searchByPaths from './search-by-paths';

describe('searchByPaths', () => {
  it('should return the original list when searchStr is empty', () => {
    const list = [{ name: 'John' }, { name: 'Jane' }];
    const searchStr = '';
    const paths = ['name']; /** @ts-expect-error: argument types */
    expect(searchByPaths(paths)(list, searchStr)).toEqual(list);
  });

  it('should return the original list when list has less than 2 items', () => {
    const list = [{ name: 'John' }];
    const searchStr = 'Jane';
    const paths = ['name']; /** @ts-expect-error: argument types */
    expect(searchByPaths(paths)(list, searchStr)).toEqual(list);
  });

  it('should filter the list based on the search string and paths', () => {
    const list = [{ name: 'John' }, { name: 'Jane' }, { name: 'John Doe' }];
    const searchStr = 'john';
    const paths = ['name']; /** @ts-expect-error: argument types */
    expect(searchByPaths(paths)(list, searchStr)).toEqual([{ name: 'John' }, { name: 'John Doe' }]);
  });
});
