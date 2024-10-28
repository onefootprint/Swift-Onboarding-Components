import {
  BusinessDI,
  type CollectKybDataRequirement,
  CollectedKybDataOption,
  IdDI,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { CommonIdvContext } from 'src/utils/state-machine';
import type { MachineContext } from '../state-machine/types';
import {
  extractBoBootstrapValues,
  extractNonBoBootstrapValues,
  getBusinessDataFromContext,
  isCollectingBusinessData,
  shouldShowAddressDataScreen,
  shouldShowBasicDataScreen,
  shouldShowManageBosScreen,
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

const getKybRequirement = ({
  missing = [],
  populated = [],
  recollect = [],
}: {
  missing?: CollectedKybDataOption[];
  populated?: CollectedKybDataOption[];
  recollect?: CollectedKybDataOption[];
}): CollectKybDataRequirement => {
  return {
    hasLinkedBos: false,
    isMet: false,
    kind: OnboardingRequirementKind.collectKybData,
    missingAttributes: missing,
    populatedAttributes: populated,
    recollectAttributes: recollect,
  };
};

describe('extractNonBoBootstrapValues', () => {
  it('should return an empty object when the input is empty', () => {
    const result = extractNonBoBootstrapValues({});
    expect(result).toEqual({});
  });

  it("should filter out 'business.beneficial_owners', 'business.kyced_beneficial_owners', 'business.secondary_owners'", () => {
    const input = {
      'business.name': { value: 'Acme Bank Inc.', isBootstrap: true },
      'business.dba': { value: 'Acme Bank', isBootstrap: true },
      'business.tin': { value: '12-3456789', isBootstrap: true },
      'business.website': { value: 'www.google.com', isBootstrap: true },
      'business.phone_number': { value: '+12025550179', isBootstrap: true },
      'business.corporation_type': { value: 'unknown', isBootstrap: true },
      'business.address_line1': { value: '123 Main St', isBootstrap: true },
      'business.address_line2': { value: 'Apt 123', isBootstrap: true },
      'business.city': { value: 'Boston', isBootstrap: true },
      'business.state': { value: 'MA', isBootstrap: true },
      'business.zip': { value: '02117', isBootstrap: true },
      'business.country': { value: 'US' as const, isBootstrap: true },
      'business.secondary_owners': {
        value: [
          {
            first_name: 'Owner',
            last_name: 'Last',
            email: 'owners@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
      'business.kyced_beneficial_owners': {
        value: [
          {
            first_name: 'Owner',
            last_name: 'Last',
            email: 'owners@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
      'business.beneficial_owners': {
        value: [
          {
            first_name: 'Owner',
            last_name: 'Last',
            email: 'owners@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
    };

    const result = extractNonBoBootstrapValues(input);
    expect(result).toEqual({
      'business.address_line1': '123 Main St',
      'business.address_line2': 'Apt 123',
      'business.city': 'Boston',
      'business.corporation_type': 'unknown',
      'business.country': 'US',
      'business.dba': 'Acme Bank',
      'business.name': 'Acme Bank Inc.',
      'business.phone_number': '+12025550179',
      'business.state': 'MA',
      'business.tin': '12-3456789',
      'business.website': 'www.google.com',
      'business.zip': '02117',
    });
  });

  it('should filter out null and undefined values', () => {
    const input = {
      'business.name': { value: 'name', isBootstrap: true },
      'business.dba': { value: undefined, isBootstrap: true },
      'business.tin': { value: undefined, isBootstrap: true },
      'business.website': { value: undefined, isBootstrap: true },
      'business.phone_number': { value: undefined, isBootstrap: true },
      'business.corporation_type': { value: undefined, isBootstrap: true },
      'business.address_line1': { value: undefined, isBootstrap: true },
      'business.address_line2': { value: undefined, isBootstrap: true },
      'business.city': { value: undefined, isBootstrap: true },
      'business.state': { value: undefined, isBootstrap: true },
      'business.zip': { value: undefined, isBootstrap: true },
      'business.country': { value: undefined, isBootstrap: true },
    };

    // @ts-expect-error: passing an invalid type intentionally
    const result = extractNonBoBootstrapValues(input);
    expect(result).toEqual({ 'business.name': 'name' });
  });
});

describe('getBusinessDataFromContext', () => {
  it('should build kyced_beneficial_owners from bootstrapUserData', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.beneficialOwners] }),
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.beneficialOwners] }),
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.name, CollectedKybDataOption.website] }),
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.name, CollectedKybDataOption.website] }),
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.name, CollectedKybDataOption.website] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(getBusinessDataFromContext(ctx)).toEqual({});
  });
});

describe('isCollectingBusinessData', () => {
  it('should return true when some required attributes are missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.name] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isCollectingBusinessData(ctx);
    expect(result).toBe(true);
  });

  it('should return false when some required attributes are present', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.name] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: { [BusinessDI.name]: 'Acme' },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = isCollectingBusinessData(ctx);
    expect(result).toBe(false);
  });

  it('should be true if TIN is missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [CollectedKybDataOption.tin],
        populated: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.kycedBeneficialOwners,
          CollectedKybDataOption.address,
        ],
      }),
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

    const result = isCollectingBusinessData(ctx);
    expect(result).toBe(true);
  });
});

describe('isMissingBasicData', () => {
  it('should return true when all basic data attributes are missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.corporationType,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
        ],
      }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = shouldShowBasicDataScreen(ctx);
    expect(result).toBe(true);
  });

  it('should return false when required attributes are present', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [CollectedKybDataOption.name, CollectedKybDataOption.tin, CollectedKybDataOption.website],
      }),
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

    const result = shouldShowBasicDataScreen(ctx);
    expect(result).toBe(false);
  });
});

describe('isMissingAddressData', () => {
  it('should return false when there are no missing address attributes', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.address] }),
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

    const result = shouldShowAddressDataScreen(ctx);
    expect(result).toBe(false);
  });

  it('should return false when optional addressLine2 is missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.address] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        [BusinessDI.addressLine1]: '123 Main St',
        // [BusinessDI.addressLine2]: 'Apt 1', - intentionally commented
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = shouldShowAddressDataScreen(ctx);
    expect(result).toBe(false);
  });

  it('should return true when there is a missing address attribute', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.address] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {
        // [BusinessDI.addressLine1]: '123 Main St', - intentionally commented
        [BusinessDI.addressLine2]: 'Apt 1',
        [BusinessDI.city]: 'New York',
        [BusinessDI.state]: 'NY',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      },
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = shouldShowAddressDataScreen(ctx);
    expect(result).toBe(true);
  });

  it('should return true when country is missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.address] }),
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

    const result = shouldShowAddressDataScreen(ctx);
    expect(result).toBe(true);
  });

  it('should return true when in recollectAttributes', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [CollectedKybDataOption.address],
        recollect: [CollectedKybDataOption.address],
      }),
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

    const result = shouldShowAddressDataScreen(ctx);
    expect(result).toBe(true);
  });
});

describe('shouldShowManageBosScreen', () => {
  it('should return true when beneficial owners are missing', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(shouldShowManageBosScreen(ctx)).toBe(true);
  });

  it('should return false if kyced beneficial owners is populated', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ populated: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(shouldShowManageBosScreen(ctx)).toBe(false);
  });
});

describe('extractBoBootstrapValues', () => {
  it('should return an empty object when business.kyced_beneficial_owners is not populated', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
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
    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when business.beneficial_owners is populated', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.beneficialOwners] }),
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
    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({});
  });

  it('should return an empty object when missingAttributes is empty', () => {
    const ctx = {
      kybRequirement: getKybRequirement({}),
      idvContext: idvContext,
      bootstrapBusinessData: {
        [BusinessDI.name]: { value: 'Acme Inc', isBootstrap: true },
        [BusinessDI.doingBusinessAs]: { value: 'acme', isBootstrap: true },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({});
  });

  it('should return an object with business.kyced_beneficial_owners when kycedBeneficialOwners is required', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
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

    const result = extractBoBootstrapValues(ctx);
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
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.beneficialOwners] }),
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

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.beneficial_owners': [
        {
          first_name: 'John',
          last_name: 'Doe',
        },
      ],
    });
  });

  it('should ignore email and phoneNumber in business.beneficial_owners', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.beneficialOwners] }),
      idvContext: idvContext,
      bootstrapBusinessData: {
        'business.secondary_owners': {
          value: [
            {
              first_name: 'Owner',
              last_name: 'Last',
              email: 'owners@acme.com',
              phone_number: '+12025550179',
              ownership_stake: 50,
            },
          ],
          isBootstrap: true,
        },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.beneficial_owners': [
        // Primary BO is inferred from id data or empty
        {},
        // Secondary BO data passed in
        { first_name: 'Owner', last_name: 'Last', ownership_stake: 50 },
      ],
    });
  });

  it('should consider email and phoneNumber in business.kyced_beneficial_owners', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapBusinessData: {
        'business.secondary_owners': {
          value: [
            {
              first_name: 'Owner',
              last_name: 'Last',
              email: 'owners@acme.com',
              phone_number: '+12025550179',
              ownership_stake: 50,
            },
          ],
          isBootstrap: true,
        },
      },
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.kyced_beneficial_owners': [
        // Primary BO is inferred from id data or empty
        {},
        // Secondary BO data passed in
        {
          email: 'owners@acme.com',
          first_name: 'Owner',
          last_name: 'Last',
          ownership_stake: 50,
          phone_number: '+12025550179',
        },
      ],
    });
  });

  it('constructs primary BO using id.xxx data and business.primary_owner_stake', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapUserData: {
        'id.phone_number': { value: '+15555550100', isBootstrap: true },
        'id.email': { value: 'sandbox@onefootprint.com', isBootstrap: true },
        'id.first_name': { value: 'Primary', isBootstrap: true },
        'id.last_name': { value: 'Owner', isBootstrap: true },
      },
      bootstrapBusinessData: {
        'business.primary_owner_stake': { value: 10, isBootstrap: true },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.kyced_beneficial_owners': [
        {
          email: 'sandbox@onefootprint.com',
          first_name: 'Primary',
          last_name: 'Owner',
          ownership_stake: 10,
          phone_number: '+15555550100',
        },
      ],
    });
  });

  it('constructs primary BO id.xxx data', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapUserData: {
        'id.phone_number': { value: '+15555550100', isBootstrap: true },
        'id.email': { value: 'sandbox@onefootprint.com', isBootstrap: true },
        'id.first_name': { value: 'Primary', isBootstrap: true },
        'id.last_name': { value: 'Owner', isBootstrap: true },
      },
      bootstrapBusinessData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.kyced_beneficial_owners': [
        {
          email: 'sandbox@onefootprint.com',
          first_name: 'Primary',
          last_name: 'Owner',
          phone_number: '+15555550100',
        },
      ],
    });
  });

  it('constructs primary BO and secondary BOs', () => {
    const ctx = {
      kybRequirement: getKybRequirement({ missing: [CollectedKybDataOption.kycedBeneficialOwners] }),
      idvContext: idvContext,
      bootstrapUserData: {
        'id.phone_number': { value: '+15555550100', isBootstrap: true },
        'id.email': { value: 'sandbox@onefootprint.com', isBootstrap: true },
        'id.first_name': { value: 'Primary', isBootstrap: true },
        'id.last_name': { value: 'Owner', isBootstrap: true },
      },
      bootstrapBusinessData: {
        'business.secondary_owners': {
          value: [
            {
              first_name: 'Owner',
              last_name: 'Last',
              email: 'owners@acme.com',
              phone_number: '+12025550179',
              ownership_stake: 50,
            },
          ],
          isBootstrap: true,
        },
      },
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    const result = extractBoBootstrapValues(ctx);
    expect(result).toEqual({
      'business.kyced_beneficial_owners': [
        {
          email: 'sandbox@onefootprint.com',
          first_name: 'Primary',
          last_name: 'Owner',
          phone_number: '+15555550100',
        },
        {
          email: 'owners@acme.com',
          first_name: 'Owner',
          last_name: 'Last',
          ownership_stake: 50,
          phone_number: '+12025550179',
        },
      ],
    });
  });
});

describe('shouldShowManageBosScreen', () => {
  it('should return true when kycedBeneficialOwners needs to be recollected', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [],
        populated: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.address,
          CollectedKybDataOption.kycedBeneficialOwners,
        ],
        recollect: [CollectedKybDataOption.kycedBeneficialOwners],
      }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(shouldShowManageBosScreen(ctx)).toBe(true);
  });

  it('should false true when kycedBeneficialOwners does not need to recollected', () => {
    const ctx = {
      kybRequirement: getKybRequirement({
        missing: [],
        populated: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.address,
          CollectedKybDataOption.kycedBeneficialOwners,
        ],
        recollect: [],
      }),
      idvContext: idvContext,
      bootstrapBusinessData: {},
      bootstrapUserData: {},
      data: {},
      dataCollectionScreensToShow: [],
    } satisfies MachineContext;

    expect(shouldShowManageBosScreen(ctx)).toBe(false);
  });
});
