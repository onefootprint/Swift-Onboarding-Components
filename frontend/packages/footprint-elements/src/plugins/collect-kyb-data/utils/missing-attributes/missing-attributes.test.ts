import {
  BeneficialOwnerDataAttribute,
  BusinessDataAttribute,
  CollectedKybDataOption,
} from '@onefootprint/types';

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

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.name])).toBe(
      true,
    );

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.name], {
        [BusinessDataAttribute.name]: 'Acme',
      }),
    ).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.tin])).toBe(
      true,
    );

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.tin], {
        [BusinessDataAttribute.tin]: '123456789',
      }),
    ).toBe(false);

    expect(isMissingBasicDataAttribute([CollectedKybDataOption.website])).toBe(
      true,
    );
    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.website], {
        [BusinessDataAttribute.website]: 'https://acme.com',
      }),
    ).toBe(false);

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.phoneNumber]),
    ).toBe(true);

    expect(
      isMissingBasicDataAttribute([CollectedKybDataOption.phoneNumber], {
        [BusinessDataAttribute.phoneNumber]: '1234567890',
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
          [BusinessDataAttribute.name]: 'Acme',
          [BusinessDataAttribute.phoneNumber]: '1234567890',
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
          [BusinessDataAttribute.name]: 'Acme',
          [BusinessDataAttribute.tin]: '123456789',
          [BusinessDataAttribute.website]: 'https://acme.com',
          [BusinessDataAttribute.phoneNumber]: '1234567890',
        },
      ),
    ).toBe(false);
  });

  it('isMissingBusinessAddressAttribute', () => {
    expect(isMissingBusinessAddressAttribute([])).toBe(false);

    expect(isMissingBusinessAddressAttribute([], {})).toBe(false);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address]),
    ).toBe(true);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Suite 1',
        [BusinessDataAttribute.city]: 'San Francisco',
        [BusinessDataAttribute.state]: 'CA',
        [BusinessDataAttribute.zip]: '94105',
        [BusinessDataAttribute.country]: 'US',
      }),
    ).toBe(false);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.city]: 'San Francisco',
        [BusinessDataAttribute.state]: 'CA',
        [BusinessDataAttribute.zip]: '94105',
        [BusinessDataAttribute.country]: 'US',
      }),
    ).toBe(false);

    expect(
      isMissingBusinessAddressAttribute([CollectedKybDataOption.address], {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Suite 1',
      }),
    ).toBe(true);

    expect(
      isMissingBusinessAddressAttribute(
        [CollectedKybDataOption.name, CollectedKybDataOption.address],
        {
          [BusinessDataAttribute.addressLine1]: '123 Main St',
          [BusinessDataAttribute.addressLine2]: 'Suite 1',
        },
      ),
    ).toBe(true);
  });

  it('isMissingBeneficialOwnersAttribute', () => {
    expect(isMissingBeneficialOwnerAttribute([])).toBe(false);

    expect(isMissingBeneficialOwnerAttribute([], {})).toBe(false);

    expect(
      isMissingBeneficialOwnerAttribute([
        CollectedKybDataOption.beneficialOwners,
      ]),
    ).toBe(true);

    expect(
      isMissingBeneficialOwnerAttribute(
        [CollectedKybDataOption.beneficialOwners],
        {
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
              [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
            },
          ],
        },
      ),
    ).toBe(false);
  });

  it('hasMissingAttributes', () => {
    expect(hasMissingAttributes([])).toBe(false);

    expect(hasMissingAttributes([], {})).toBe(false);

    expect(
      hasMissingAttributes([], {
        [BusinessDataAttribute.name]: 'Acme',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.name])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.name], {
        [BusinessDataAttribute.name]: 'Acme',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.tin])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.tin], {
        [BusinessDataAttribute.tin]: '123456789',
      }),
    ).toBe(false);

    expect(hasMissingAttributes([CollectedKybDataOption.address])).toBe(true);

    expect(
      hasMissingAttributes([CollectedKybDataOption.address], {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Suite 1',
        [BusinessDataAttribute.city]: 'San Francisco',
        [BusinessDataAttribute.state]: 'CA',
        [BusinessDataAttribute.zip]: '94105',
        [BusinessDataAttribute.country]: 'US',
      }),
    ).toBe(false);

    expect(
      hasMissingAttributes([CollectedKybDataOption.address], {
        [BusinessDataAttribute.addressLine1]: '123 Main St',
        [BusinessDataAttribute.addressLine2]: 'Suite 1',
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
          [BusinessDataAttribute.name]: 'Acme',
          [BusinessDataAttribute.tin]: '123456789',
          [BusinessDataAttribute.website]: 'https://acme.com',
          [BusinessDataAttribute.phoneNumber]: '1234567890',
          [BusinessDataAttribute.addressLine1]: '123 Main St',
          [BusinessDataAttribute.addressLine2]: 'Suite 1',
          [BusinessDataAttribute.city]: 'San Francisco',
          [BusinessDataAttribute.state]: 'CA',
          [BusinessDataAttribute.zip]: '94105',
          [BusinessDataAttribute.country]: 'US',
          [BusinessDataAttribute.beneficialOwners]: [
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
              [BeneficialOwnerDataAttribute.email]: 'john@gmail.com',
            },
          ],
        },
      ),
    ).toBe(false);
  });
});
