import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption } from '@onefootprint/types';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from './missing-attributes';

describe('MissingAttributes tests', () => {
  it('isMissingBasicDataAttribute', () => {
    expect(isMissingBasicDataAttribute([])).toBe(false);

    expect(isMissingBasicDataAttribute([], {})).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.name])).toBe(true);

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.name], {
        [BusinessDI.name]: 'Acme',
      }),
    ).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.tin])).toBe(true);

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.tin], {
        [BusinessDI.tin]: '123456789',
      }),
    ).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.website])).toBe(true);
    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.website], {
        [BusinessDI.website]: 'https://acme.com',
      }),
    ).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.phoneNumber])).toBe(true);

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.phoneNumber], {
        [BusinessDI.phoneNumber]: '1234567890',
      }),
    ).toBe(false);

    expect(
      isMissingBasicDataAttribute([
        CollectedKybDataOption.name,
        CollectedKybDataOption.tin,
        CollectedKybDataOption.website,
        CollectedKybDataOption.phoneNumber,
        CollectedKybDataOption.address,
        CollectedKybDataOption.beneficialOwners,
      ]),
    ).toBe(true);

    expect(
      isMissingBasicDataAttribute(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.website,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        {
          [BusinessDI.name]: 'Acme',
          [BusinessDI.phoneNumber]: '1234567890',
        },
      ),
    ).toBe(true);

    expect(
      isMissingBasicDataAttribute(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.website,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        {
          [BusinessDI.name]: 'Acme',
          [BusinessDI.tin]: '123456789',
          [BusinessDI.website]: 'https://acme.com',
          [BusinessDI.phoneNumber]: '1234567890',
        },
      ),
    ).toBe(false);
  });

  it('isMissingBusinessAddressAttribute', () => {
    expect(isMissingBusinessAddressAttribute([])).toBe(false);

    expect(isMissingBusinessAddressAttribute([], {})).toBe(false);

    expect(isMissingBusinessAddressAttribute([CollectedKybDataOption.address])).toBe(true);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Suite 1',
        [BusinessDI.city]: 'San Francisco',
        [BusinessDI.state]: 'CA',
        [BusinessDI.zip]: '94105',
        [BusinessDI.country]: 'US',
      }),
    ).toBe(false);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.city]: 'San Francisco',
        [BusinessDI.state]: 'CA',
        [BusinessDI.zip]: '94105',
        [BusinessDI.country]: 'US',
      }),
    ).toBe(false);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Suite 1',
      }),
    ).toBe(true);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.name, CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Suite 1',
      }),
    ).toBe(true);
  });

  it('isMissingBeneficialOwnersAttribute', () => {
    expect(isMissingBeneficialOwnerAttribute([])).toBe(false);

    expect(isMissingBeneficialOwnerAttribute([], {})).toBe(false);

    expect(isMissingBeneficialOwnerAttribute([CollectedKybDataOption.beneficialOwners])).toBe(true);

    expect(
      isMissingBeneficialOwnerAttribute([CollectedKybDataOption.beneficialOwners], {
        [BusinessDI.beneficialOwners]: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
            [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
          },
        ],
      }),
    ).toBe(false);
  });

  it('hasMissingAttributes', () => {
    expect(hasMissingAttributes([])).toBe(false);

    expect(hasMissingAttributes([], {})).toBe(false);

    expect(
      hasMissingAttributes([], {
        [BusinessDI.name]: 'Acme',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.name])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.name], {
        [BusinessDI.name]: 'Acme',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.tin])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.tin], {
        [BusinessDI.tin]: '123456789',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.address])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Suite 1',
        [BusinessDI.city]: 'San Francisco',
        [BusinessDI.state]: 'CA',
        [BusinessDI.zip]: '94105',
        [BusinessDI.country]: 'US',
      }),
    ).toBe(false);

    expect(
      hasMissingAttributes([CollectedKybDataOption.address], {
        [BusinessDI.addressLine1]: '123 Main St',
        [BusinessDI.addressLine2]: 'Suite 1',
      }),
    ).toBe(true);

    expect(
      hasMissingAttributes(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.website,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        {},
      ),
    ).toBe(true);

    expect(
      hasMissingAttributes(
        [
          CollectedKybDataOption.name,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.website,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
        ],
        {
          [BusinessDI.name]: 'Acme',
          [BusinessDI.tin]: '123456789',
          [BusinessDI.website]: 'https://acme.com',
          [BusinessDI.phoneNumber]: '1234567890',
          [BusinessDI.addressLine1]: '123 Main St',
          [BusinessDI.addressLine2]: 'Suite 1',
          [BusinessDI.city]: 'San Francisco',
          [BusinessDI.state]: 'CA',
          [BusinessDI.zip]: '94105',
          [BusinessDI.country]: 'US',
          [BusinessDI.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
              [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
              [BeneficialOwnerDataAttribute.phoneNumber]: '1234567890',
            },
          ],
        },
      ),
    ).toBe(false);
  });
});
