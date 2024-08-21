import { BusinessDI, CollectedKybDataOption, IdDI } from '@onefootprint/types';

import type { BusinessData } from 'src/types';
import type { MachineContext } from '../state-machine/types';
import {
  extractBootstrapBusinessDataValues,
  extractBusinessOwnerValuesFromBootstrapUserData,
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
  it('should build kyced_beneficial_owners from bootstrapUserData', () => {
    const ctx = {
      kybRequirement: { missingAttributes: ['business_kyced_beneficial_owners'] },
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name' },
        'id.last_name': { value: 'id.last-name' },
      },
      data: {},
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.kyced_beneficial_owners': [{ first_name: 'id.first-name', last_name: 'id.last-name' }],
    });
  });

  it('should build business.beneficial_owners from bootstrapUserData', () => {
    const ctx = {
      kybRequirement: { missingAttributes: ['business_beneficial_owners'] },
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name' },
        'id.last_name': { value: 'id.last-name' },
      },
      data: {},
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.beneficial_owners': [{ first_name: 'id.first-name', last_name: 'id.last-name' }],
    });
  });

  it('should respect the data already in the context', () => {
    const ctx = {
      kybRequirement: { missingAttributes: ['business_beneficial_owners'] },
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name' },
        'id.last_name': { value: 'id.last-name' },
      },
      data: {
        'business.beneficial_owners': [{ first_name: 'Joe', last_name: 'Doe' }],
      },
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.beneficial_owners': [{ first_name: 'Joe', last_name: 'Doe' }],
    });
  });

  it('should merge bootstrapBusinessData and data properties', () => {
    const ctx = {
      kybRequirement: { missingAttributes: ['business_name', 'business_website'] },
      bootstrapBusinessData: {
        'business.name': { value: 'Acme Inc' },
        'business.website': { value: 'www.acme.com' },
      },
      data: {
        'business.tin': '123456789',
        'business.address_line1': '123 Main St',
      },
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.name': 'Acme Inc',
      'business.website': 'www.acme.com',
      'business.tin': '123456789',
      'business.address_line1': '123 Main St',
    });
  });

  it('should override data properties with bootstrapBusinessData', () => {
    const ctx = {
      bootstrapBusinessData: { 'business.name': { value: 'Bootstrapped name' } },
      data: { 'business.name': 'Data name' },
    } as unknown as MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({ 'business.name': 'Data name' });
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

  it('should be true if TIN is missing', () => {
    const ctx = {
      kybRequirement: {
        missingAttributes: ['business_tin'],
        populatedAttributes: ['business_name', 'business_kyced_beneficial_owners', 'business_address'],
      },
      bootstrapBusinessData: {},
      data: {
        'business.address_line1': '300 Park Avenue',
        'business.city': 'New York',
        'business.country': 'US',
        'business.name': 'Piper',
        'business.state': 'NY',
        'business.zip': '10022',
        'business.kyced_beneficial_owners': [
          {
            email: null,
            first_name: 'asd',
            last_name: 'asd',
            link_id: 'bo_link_primary',
            ownership_stake: 100,
            phone_number: '+1234',
          },
        ],
      },
    } as unknown as MachineContext;
    const result = isMissingRequiredData(ctx);
    expect(result).toBe(true);
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

  it('should return true when country is missing', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.address] },
      bootstrapBusinessData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.city]: 'city',
        [BusinessDI.state]: 'state',
        [BusinessDI.zip]: 'zip',
        [BusinessDI.country]: '',
      },
    } as unknown as MachineContext;
    const result = isMissingAddressData(ctx);
    expect(result).toBe(true);
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

describe('extractBusinessOwnerValuesFromBootstrapUserData', () => {
  it('should return an empty object when business.kyced_beneficial_owners is populated', () => {
    const ctx = {
      bootstrapBusinessData: { 'business.kyced_beneficial_owners': [] },
    } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when business.beneficial_owners is populated', () => {
    const ctx = {
      bootstrapBusinessData: { 'business.beneficial_owners': [] },
    } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when business.kyced_beneficial_owners is populated', () => {
    const ctx = { data: { 'business.kyced_beneficial_owners': 'some value' } } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when business.beneficial_owners is populated', () => {
    const ctx = { data: { 'business.beneficial_owners': 'some value' } } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when missingAttributes is empty', () => {
    const ctx = { kybRequirement: { missingAttributes: [] } } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an object with business.kyced_beneficial_owners when kycedBeneficialOwners is required', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners] },
      bootstrapUserData: {
        'id.first_name': { value: 'John' },
        'id.last_name': { value: 'Doe' },
        'id.email': { value: 'email@o.com' },
        'id.phone_number': { value: '123' },
      },
    } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({
      'business.kyced_beneficial_owners': [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'email@o.com',
          phone_number: '123',
        },
      ],
    });
  });

  it('should return an object with business.beneficial_owners when beneficialOwners is required', () => {
    const ctx = {
      kybRequirement: { missingAttributes: [CollectedKybDataOption.beneficialOwners] },
      bootstrapUserData: {
        'id.first_name': { value: 'John' },
        'id.last_name': { value: 'Doe' },
        'id.email': { value: 'email@o.com' },
        'id.phone_number': { value: '123' },
      },
    } as unknown as MachineContext;
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({
      'business.beneficial_owners': [
        {
          first_name: 'John',
          last_name: 'Doe',
        },
      ],
    });
  });
});
