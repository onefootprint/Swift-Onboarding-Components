import getAliasforListName from './get-alias-for-list-name';

describe('getAliasForListName', () => {
  it('should return the alias for the list name', () => {
    expect(getAliasforListName('Blocked users')).toBe('@blocked_users');
    expect(getAliasforListName('Blocked Users!!')).toBe('@blocked_users__');
    expect(getAliasforListName('Blocked2Users')).toBe('@blocked2users');
  });
});
