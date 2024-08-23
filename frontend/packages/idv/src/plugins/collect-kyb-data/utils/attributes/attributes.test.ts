import { BusinessDI, CollectedKybDataOption, IdDI, OnboardingRequirementKind } from '@onefootprint/types';

import type { BusinessData } from 'src/types';
import type { CommonIdvContext } from 'src/utils/state-machine';
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

const idvContext = {
  device: {
    browser: 'string',
    osName: 'string',
    type: 'string',
    hasSupportForWebauthn: false,
    initialCameraPermissionState: 'prompt',
  },
  authToken: 'string',
} satisfies CommonIdvContext;

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
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name', isBootstrap: true },
        'id.last_name': { value: 'id.last-name', isBootstrap: true },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.kyced_beneficial_owners': [{ first_name: 'id.first-name', last_name: 'id.last-name' }],
    });
  });

  it('should build business.beneficial_owners from bootstrapUserData', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name', isBootstrap: true },
        'id.last_name': { value: 'id.last-name', isBootstrap: true },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.beneficial_owners': [{ first_name: 'id.first-name', last_name: 'id.last-name' }],
    });
  });

  it('should respect the data already in the context', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {
        'id.first_name': { value: 'id.first-name', isBootstrap: true },
        'id.last_name': { value: 'id.last-name', isBootstrap: true },
      },
      data: {
        'business.beneficial_owners': [{ first_name: 'Joe', last_name: 'Doe', ownership_stake: 100 }],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.beneficial_owners': [{ first_name: 'Joe', last_name: 'Doe', ownership_stake: 100 }],
    });
  });

  it('should merge bootstrapBusinessData and data properties', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.website],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {
        'business.name': { value: 'Acme Inc', isBootstrap: true },
        'business.website': { value: 'www.acme.com', isBootstrap: true },
      },
      bootstrapUserData: {},
      data: {
        'business.tin': '123456789',
        'business.address_line1': '123 Main St',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({
      'business.name': 'Acme Inc',
      'business.website': 'www.acme.com',
      'business.tin': '123456789',
      'business.address_line1': '123 Main St',
    });
  });

  it('should not override data properties with bootstrapBusinessData', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.website],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: { 'business.name': { value: 'Bootstrapped name', isBootstrap: true } },
      bootstrapUserData: {},
      data: { 'business.name': 'Data name' },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({ 'business.name': 'Data name' });
  });

  it('should return an empty object when there is no data', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.website],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({});
  });
});

describe('isMissingRequiredData', () => {
  it('should return true when some required attributes are missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingRequiredData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when some required attributes are present', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: { [BusinessDI.name]: 'Acme' },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingRequiredData(ctx);
    expect(result).toBe(false);
  });

  it('should be true if TIN is missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.tin],
        populatedAttributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.kycedBeneficialOwners,
          CollectedKybDataOption.address,
        ],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        'business.address_line1': '300 Park Avenue',
        'business.city': 'New York',
        'business.country': 'US',
        'business.name': 'Piper',
        'business.state': 'NY',
        'business.zip': '10022',
        'business.kyced_beneficial_owners': [
          {
            email: undefined,
            first_name: 'asd',
            last_name: 'asd',
            // @ts-expect-error: Object literal may only specify known properties, and 'link_id' does not exist in type 'BeneficialOwner'.
            link_id: 'bo_link_primary',
            ownership_stake: 100,
            phone_number: '+1234',
          },
        ],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingRequiredData(ctx);
    expect(result).toBe(true);
  });
});

describe('isMissingBasicData', () => {
  it('should return true when all basic data attributes are missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.corporationType,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
        ],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingBasicData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when required attributes are present', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.tin, CollectedKybDataOption.website],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.name]: 'Acme',
        [BusinessDI.tin]: '123456789',
        [BusinessDI.website]: 'https://acme.com',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingBasicData(ctx);
    expect(result).toBe(false);
  });
});

describe('isMissingAddressData', () => {
  it('should return false when there are no missing address attributes', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.address],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingAddressData(ctx);
    expect(result).toBe(false);
  });

  it('should return false when optional addressLine2 is missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.address],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        // [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingAddressData(ctx);
    expect(result).toBe(false);
  });

  it('should return true when there is a missing address attribute', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.address],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        // [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingAddressData(ctx);
    expect(result).toBe(true);
  });

  it('should return true when country is missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.address],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: '' as 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isMissingAddressData(ctx);
    expect(result).toBe(true);
  });
});

describe('isMissingBeneficialOwnersData', () => {
  it('should return false if beneficial owners is populated', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          {
            first_name: 'John',
            last_name: 'Doe',
            ownership_stake: 50,
          },
        ],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(isMissingBeneficialOwnersData(ctx)).toBe(false);
  });

  it('should return true when part of beneficial owners is missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.beneficialOwners]: [
          // @ts-expect-error: ownership_stake was intentionally omitted
          { first_name: 'John', last_name: 'Doe' },
        ],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    // @ts-expect-error: ownership_stake was intentionally omitted
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return false if kyced beneficial owners is populated', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.kycedBeneficialOwners]: [
          {
            first_name: 'John',
            last_name: 'Doe',
            ownership_stake: 50,
          },
        ],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(isMissingBeneficialOwnersData(ctx)).toBe(false);
  });

  it('should return true when part of kyced beneficial owners is missing', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.kycedBeneficialOwners]: [
          // @ts-expect-error: ownership_stake was intentionally omitted
          { first_name: 'John', last_name: 'Doe' },
        ],
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    // @ts-expect-error: ownership_stake was intentionally omitted
    expect(isMissingBeneficialOwnersData(ctx)).toBe(true);
  });

  it('should return false if all possible attributes are present', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.kycedBeneficialOwners]: [
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
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(isMissingBeneficialOwnersData(ctx)).toBe(false);
  });
});

describe('extractBusinessOwnerValuesFromBootstrapUserData', () => {
  it('should return an empty object when business.kyced_beneficial_owners is not populated', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {
        // @ts-expect-error: business.kyced_beneficial_owners type was removed from the bootstrap business data
        [BusinessDI.kycedBeneficialOwners]: { value: [], isBootstrap: true },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    // @ts-expect-error: business.kyced_beneficial_owners type was removed from the bootstrap business data
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when business.beneficial_owners is populated', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {
        // @ts-expect-error: business.beneficial_owners type was removed from the bootstrap business data
        [BusinessDI.beneficialOwners]: { value: [], isBootstrap: true },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    // @ts-expect-error: business.beneficial_owners type was removed from the bootstrap business data
    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when missingAttributes is empty', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {
        [BusinessDI.name]: { value: 'Acme Inc', isBootstrap: true },
        [BusinessDI.doingBusinessAs]: { value: 'acme', isBootstrap: true },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBusinessOwnerValuesFromBootstrapUserData(ctx);
    expect(result).toEqual({});
  });

  it('should return an object with business.kyced_beneficial_owners when kycedBeneficialOwners is required', () => {
    const ctx = {
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {
        [IdDI.firstName]: { value: 'John', isBootstrap: true },
        [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
        [IdDI.email]: { value: 'email@o.com', isBootstrap: true },
        [IdDI.phoneNumber]: { value: '123', isBootstrap: true },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

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
      kybRequirement: {
        hasLinkedBos: false,
        isMet: false,
        kind: OnboardingRequirementKind.collectKybData,
        missingAttributes: [CollectedKybDataOption.beneficialOwners],
        populatedAttributes: [],
      },
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {
        [IdDI.firstName]: { value: 'John', isBootstrap: true },
        [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
        [IdDI.email]: { value: 'email@o.com', isBootstrap: true },
        [IdDI.phoneNumber]: { value: '123', isBootstrap: true },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

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
