import isVaultDataBusinessOwner from './is-vault-data-business-owner';

describe('isVaultDataBusinessOwner', () => {
  it('should return true for valid BusinessOwnerDecryptedData', () => {
    const validData = [
      {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        ownership_stake: 50,
      },
      {
        first_name: 'Jane',
        last_name: 'Doe',
        ownership_stake: 50,
      },
    ];

    expect(isVaultDataBusinessOwner(validData)).toBe(true);
  });

  it('should return false for invalid data', () => {
    const invalidData = [
      {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        ownership_stake: '50%', // Invalid type for ownership_stake
      },
    ];

    expect(isVaultDataBusinessOwner(invalidData)).toBe(false);
  });

  it('should return false for non-array data', () => {
    const nonArrayData = {
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      ownership_stake: 50,
    };

    expect(isVaultDataBusinessOwner(nonArrayData)).toBe(false);
  });
});
