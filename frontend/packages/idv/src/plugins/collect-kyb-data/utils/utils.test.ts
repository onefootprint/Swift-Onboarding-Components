import { BusinessDI } from '@onefootprint/types';
import { buildBeneficialOwner, omitEqualData } from './utils';

describe('buildBeneficialOwner', () => {
  const userData = {
    'id.first_name': 'John',
    'id.middle_name': 'J',
    'id.last_name': 'Doe',
    'id.email': 'john.doe@example.com',
    'id.phone_number': '1234567890',
  };

  it('should build a kyced_beneficial_owners', () => {
    const result = buildBeneficialOwner(userData, BusinessDI.kycedBeneficialOwners);
    expect(result).toEqual({
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });
  });

  it('should build a kyced_beneficial_owners', () => {
    const result = buildBeneficialOwner(userData, BusinessDI.beneficialOwners);
    expect(result).toEqual({
      first_name: 'John',
      last_name: 'Doe',
    });
  });
});

describe('omitEqualData', () => {
  it('should return an empty object when both inputs are empty', () => {
    const vaultData = {};
    const data = {};
    expect(omitEqualData(vaultData, data)).toEqual({});
  });

  it('should return the entire data object when the vault data is empty', () => {
    const vaultData = {};
    const data = { 'business.name': 'Acme Bank Inc.' };

    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should return the entire data object when the vault data is undefined', () => {
    const vaultData = undefined;
    const data = { 'business.name': 'Acme Bank Inc.' };

    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should omit keys that are equal in both objects', () => {
    const vaultData = {
      'business.name': 'Acme Bank Inc.',
    };
    const data = {
      'business.name': 'Acme Bank Inc.',
      'business.dba': 'Acme Bank',
    };
    expect(omitEqualData(vaultData, data)).toEqual({ 'business.dba': 'Acme Bank' });
  });

  it('should return the entire array when some keys are different', () => {
    const vaultData = {
      'business.name': 'Acme Bank Inc.',
      'business.beneficial_owners': [
        {
          first_name: 'Jane',
          middle_name: 'Samantha',
          last_name: 'Doe',
          email: 'jane.doe@acme.com',
          phone_number: '+12025550179',
          ownership_stake: 99,
        },
      ],
    };
    const data = {
      'business.name': 'Acme Bank Inc.',
      'business.beneficial_owners': [
        {
          first_name: 'Jane',
          middle_name: 'Samantha',
          last_name: 'Doe',
          email: 'jane.doe@acme.com',
          phone_number: '+12025550179',
          ownership_stake: 100, // diff here
        },
      ],
    };
    expect(omitEqualData(vaultData, data)).toEqual({
      'business.beneficial_owners': [
        {
          first_name: 'Jane',
          middle_name: 'Samantha',
          last_name: 'Doe',
          email: 'jane.doe@acme.com',
          phone_number: '+12025550179',
          ownership_stake: 100,
        },
      ],
    });
  });

  it('should return the entire array when some keys are different', () => {
    const vaultData = {
      'business.name': 'Acme Bank Inc.',
      'business.beneficial_owners': [
        {
          first_name: 'Jane',
          middle_name: 'Samantha',
          last_name: 'Doe',
          email: 'jane.doe@acme.com',
          phone_number: '+12025550179',
          ownership_stake: 99,
        },
      ],
    };
    const data = {
      'business.name': 'Acme Bank Inc.',
    };
    expect(omitEqualData(vaultData, data)).toEqual({});
  });

  it('should return data when it does not contain vault data', () => {
    const vaultData = { 'business.name': 'Acme Bank Inc.' };
    const data = { 'business.name': 'Banana Inc.' };
    expect(omitEqualData(vaultData, data)).toEqual({ 'business.name': 'Banana Inc.' });
  });

  it('should return data when one of the object keys in the array is different "Josh" != "Josn"', () => {
    const vaultData = {
      'business.beneficial_owners': [
        { first_name: 'Jack', middle_name: 'Jill', last_name: 'Jane', ownership_stake: 70 },
        { first_name: 'Jim', middle_name: 'Joe', last_name: 'Josh', ownership_stake: 30 },
      ],
    };
    const data = {
      'business.beneficial_owners': [
        { ownership_stake: 70, first_name: 'Jack', middle_name: 'Jill', last_name: 'Jane' },
        { ownership_stake: 30, first_name: 'Jim', middle_name: 'Joe', last_name: 'Josn' },
      ],
    };
    expect(omitEqualData(vaultData, data)).toEqual(data);
  });
});
