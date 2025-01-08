import { isBONameDI, isBOStakeDI, isBeneficialOwnerDI } from './is-beneficial-owner-di';

describe('isBeneficialOwnerDI', () => {
  it('should return true if the DI is a beneficial owner DI', () => {
    expect(isBeneficialOwnerDI('business.beneficial_owners.bo_id123.business_owner')).toBe(true);
    expect(isBeneficialOwnerDI('business.beneficial_owners.bo_id123.ownership_stake')).toBe(true);
  });

  it('should return false if the DI is not a beneficial owner DI', () => {
    expect(isBeneficialOwnerDI('')).toBe(false);
    expect(isBeneficialOwnerDI('business.bo_id123.beneficial_owners')).toBe(false);
    expect(isBeneficialOwnerDI('id.first_name')).toBe(false);
  });
});

describe('isBOStakeDI', () => {
  it('should return true if the DI is a beneficial owner ownership stake DI', () => {
    expect(isBOStakeDI('business.beneficial_owners.bo_id123.ownership_stake')).toBe(true);
  });

  it('should return false if the DI is not a beneficial owner ownership stake DI', () => {
    expect(isBOStakeDI('business.beneficial_owners.bo_id123.business_owner')).toBe(false);
    expect(isBOStakeDI('business.bo_id123.ownership_stake')).toBe(false);
  });
});

describe('isBONameDI', () => {
  it('should return true if the DI is a beneficial owner business owner DI', () => {
    expect(isBONameDI('business.beneficial_owners.bo_id123.business_owner')).toBe(true);
  });

  it('should return false if the DI is not a beneficial owner business owner DI', () => {
    expect(isBONameDI('business.beneficial_owners.bo_id123.ownership_stake')).toBe(false);
    expect(isBONameDI('business.bo_id123.business_owner')).toBe(false);
  });
});
