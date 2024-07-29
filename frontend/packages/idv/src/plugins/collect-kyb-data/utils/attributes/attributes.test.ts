import { BusinessDI, CollectedKybDataOption, IdDI } from '@onefootprint/types';

import { BusinessData } from 'src/types';
import { MachineContext } from '../state-machine/types';
import {
  extractBootstrapBusinessDataValues,
  getBusinessDataFromContext,
  isMissingAddressData,
  isMissingBasicData,
  isMissingBeneficialOwnersData,
  isMissingRequiredData,
} from './attributes';

describe('extractBootstrapBusinessDataValues', () => {
  it('should return an empty object when the input is empty', () => {
    const result = extractBootstrapBusinessDataValues({});
    expect(result).toEqual({});
  });

  it('should return an object with the correct keys and values when the input is not empty', () => {
    const input = {
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: 'john.doe@example.com', isBootstrap: true },
    } as BusinessData;

    const result = extractBootstrapBusinessDataValues(input);
    expect(result).toEqual({
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
      [IdDI.email]: 'john.doe@example.com',
    });
  });

  it('should ignore keys that have a null value', () => {
    const input = {
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: null, isBootstrap: true },
    } as BusinessData;

    const result = extractBootstrapBusinessDataValues(input);
    expect(result).toEqual({
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
    });
  });

  it('should ignore keys that have an undefined value', () => {
    const input = {
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: undefined, isBootstrap: true },
    } as BusinessData;

    const result = extractBootstrapBusinessDataValues(input);
    expect(result).toEqual({
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
    });
  });
});

describe('getBusinessDataFromContext', () => {
  it('should merge bootstrapBusinessData and data properties', () => {
    const ctx = {
      bootstrapBusinessData: {
        name: { value: 'Acme Inc' },
        website: { value: 'www.acme.com' },
      },
      data: {
        tin: '123456789',
        addressLine1: '123 Main St',
      },
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      name: 'Acme Inc',
      website: 'www.acme.com',
      tin: '123456789',
      addressLine1: '123 Main St',
    });
  });

  it('should override data properties with bootstrapBusinessData', () => {
    const ctx = {
      bootstrapBusinessData: { name: { value: 'Bootstrapped name' } },
      data: { name: 'Data name' },
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({ name: 'Data name' });
  });

  it('should handle empty bootstrapBusinessData and data properties', () => {
    const ctx: MachineContext = { bootstrapBusinessData: {}, data: {} } as unknown as MachineContext;
    expect(getBusinessDataFromContext(ctx)).toEqual({});
  });
});

describe('isMissingRequiredData', () => {
  it('should return true when some required attributes are missing', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.name] },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    const result = isMissingRequiredData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when some required attributes are present', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.name] },
      bootstrapBusinessData: {},
      data: { [BusinessDI.name]: 'Acme' },
    } as unknown as MachineContext;
    const result = isMissingRequiredData(ctx);
    expect(result).toBe(false);
  });
});

describe('isMissingBasicData', () => {
  it('should return true when all basic data attributes are missing', () => {
    const ctx = {
      kybRequirement: {
        missingAttributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.corporationType,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
        ],
      },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    const result = isMissingBasicData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when required attributes are present', () => {
    const ctx = {
      kybRequirement: {
        missingAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.tin, CollectedKybDataOption.website],
      },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.name]: 'Acme',
        [BusinessDI.tin]: '123456789',
        [BusinessDI.website]: 'https://acme.com',
      },
    } as unknown as MachineContext;
    const result = isMissingBasicData(ctx);
    expect(result).toBe(false);
  });

  it('should return false when no basic data attributes are missing', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.name]: 'Acme',
        [BusinessDI.tin]: '123456789',
        [BusinessDI.website]: 'https://acme.com',
        [BusinessDI.phoneNumber]: '9876543210',
        [BusinessDI.corporationType]: 'LLC',
      },
    } as unknown as MachineContext;
    const result = isMissingBasicData(ctx);
    expect(result).toBe(false);
  });

  it('should return true when "business_tin" is missing', () => {
    const ctx = {
      kybRequirement: {
        missingAttributes: ['business_name'],
        populatedAttributes: [
          'business_tin',
          'business_beneficial_owners',
          'business_address',
          'business_corporation_type',
          'business_website',
          'business_phone_number',
        ],
      },
      bootstrapBusinessData: {},
      data: {
        'business.corporation_type': 'non_profit',
        'business.kyced_beneficial_owners': null,
        'business.state': 'NY',
        'business.address_line2': null,
        'business.phone_number': '+15555550100',
        'business.country': 'US',
        'business.address_line1': '111 Broadway',
        'business.city': 'New York',
        'business.dba': 'Banana',
        'business.beneficial_owners': [
          {
            first_name: 'Bob',
            last_name: 'Lee',
            email: 'bruno@onefootprint.com',
            phone_number: '+15555550100',
            ownership_stake: 50,
          },
        ],
        'business.formation_state': null,
        'business.formation_date': null,
        'business.website': 'https://www.banana.com',
        'business.zip': '10006',
        'business.name': 'Banana Biz',
      },
    } as unknown as MachineContext;
    const result = isMissingBasicData(ctx);
    expect(result).toBe(true);
  });
});

describe('isMissingAddressData', () => {
  it('should return false when there are no missing address attributes', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [] },
      bootstrapBusinessData: {},
      data: { [BusinessDI.addressLine1]: '123 Main St' }, // Assuming address data is present
    } as unknown as MachineContext;
    const result = isMissingAddressData(ctx);
    expect(result).toBe(false);
  });

  it('should return false when missingAttributes array is empty', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [] },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    const result = isMissingAddressData(ctx);
    expect(result).toBe(false);
  });

  it('should return true when there is a missing address attribute', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.address] },
      bootstrapBusinessData: {},
      data: {}, // Missing address data
    } as unknown as MachineContext;
    const result = isMissingAddressData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when the required attribute is present in the data', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.address] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.city]: 'city',
        [BusinessDI.state]: 'state',
        [BusinessDI.zip]: 'zip',
        [BusinessDI.country]: 'country',
      },
    } as unknown as MachineContext;
    const result = isMissingAddressData(ctx);
    expect(result).toBe(false);
  });
});

describe('isMissingBeneficialOwnersData', () => {
  it('should return false if ctx.kybRequirement.missingAttributes is empty', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [] },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(false);
  });

  it('should return true when beneficialOwners is required', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return true when kycedBeneficialOwners is required', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners] },
      bootstrapBusinessData: {},
      data: {},
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return true if last_name are not present', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          {
            first_name: 'first',
            middle_name: 'middle',
            ownership_stake: 10,
            email: 'email@onefootprint.com',
            phone_number: '+15555550100',
          },
        ],
      },
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return true if first_name are not present', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          {
            middle_name: 'middle',
            last_name: 'last',
            ownership_stake: 10,
            email: 'email@onefootprint.com',
            phone_number: '+15555550100',
          },
        ],
      },
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return true if ownership_stake are not present', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          {
            first_name: 'first',
            middle_name: 'middle',
            last_name: 'last',
            email: 'email@onefootprint.com',
            phone_number: '+15555550100',
            ownership_stake: '',
          },
        ],
      },
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return false if all required attributes are present', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          {
            first_name: 'first',
            middle_name: 'middle',
            last_name: 'last',
            ownership_stake: 10,
            email: 'email@onefootprint.com',
            phone_number: '+15555550100',
          },
        ],
      },
    } as unknown as MachineContext;
    expect(isMissingBeneficialOwnersData(ctx)).toBe(false);
  });
});
