import type { CollectedDataOption, DataIdentifier } from '@onefootprint/request-types/dashboard';
import { customRenderHook } from '@onefootprint/test-utils';
import useTranslateAndSortFields from './use-translate-and-sort-fields';

describe('useTranslateAndSortFields', () => {
  it.each([
    {
      cdos: [],
      dis: ['custom.environment', 'custom.flerp', 'id.drivers_license_number'],
      x: ['custom.environment', 'custom.flerp', "Driver's license number"],
    },
    {
      cdos: ['ssn9', 'us_tax_id'],
      dis: ['id.us_tax_id', 'id.ssn9'],
      x: ['SSN (Full)', 'US Tax ID'],
    },
    {
      cdos: ['business_kyced_beneficial_owners'],
      dis: [],
      x: ['Beneficial owners'],
    },
    {
      cdos: [],
      dis: [
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.ownership_stake',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.phone_number',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.last_name',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.email',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.first_name',
        'business.beneficial_owners.business_beneficial_owner_explanation_message',
      ],
      // Should only have one entry here, despite having multiple DIs
      x: ['Beneficial owners'],
    },
    {
      cdos: ['dob', 'ssn9', 'email', 'us_tax_id', 'phone_number'],
      dis: [
        'id.ssn9',
        'id.citizenships',
        'id.phone_number',
        'id.city',
        'id.address_line1',
        'id.email',
        'id.us_tax_id',
        'id.dob',
        'id.first_name',
        'investor_profile.declarations',
      ],
      // Mix of CDOs and DIs displayed
      x: [
        'Date of birth',
        'Email',
        'Address line 1',
        'City',
        'Declaration(s)',
        'First name',
        'Phone number',
        'SSN (Full)',
        'Citizenship',
        'US Tax ID',
      ],
    },
  ])('.', ({ cdos, dis, x }) => {
    const { result } = customRenderHook(() =>
      useTranslateAndSortFields(dis as DataIdentifier[], cdos as CollectedDataOption[]),
    );
    expect(result.current).toEqual(x);
  });
});
