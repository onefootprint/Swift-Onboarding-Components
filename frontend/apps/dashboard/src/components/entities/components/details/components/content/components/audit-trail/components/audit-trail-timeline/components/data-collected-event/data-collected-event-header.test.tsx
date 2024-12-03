import type { DataCollectedInfo } from '@onefootprint/request-types/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import DataCollectedEventHeader from './data-collected-event-header';

describe('DataCollectEventHeader', () => {
  it.each([
    {
      attributes: [],
      targets: ['custom.environment'],
      x: ['custom.environment'],
    },
    {
      attributes: [],
      targets: [
        'card.vpfajqcfy2py0.billing_address.zip',
        'card.vpfajqcfy2py0.expiration',
        'card.vpfajqcfy2py0.number_last4',
        'card.vpfajqcfy2py0.expiration_month',
        'card.vpfajqcfy2py0.number',
        'card.vpfajqcfy2py0.expiration_year',
        'card.vpfajqcfy2py0.issuer',
        'card.vpfajqcfy2py0.fingerprint',
        'card.vpfajqcfy2py0.cvc',
      ],
      x: ['Financial data'],
    },
    {
      attributes: ['ssn9', 'us_tax_id'],
      targets: ['id.ssn4', 'id.us_tax_id', 'id.ssn9'],
      x: ['SSN (Full)', 'US Tax ID'],
    },
    {
      attributes: ['business_kyced_beneficial_owners'],
      targets: [],
      x: ['Business beneficial owners'],
    },
    {
      attributes: ['investor_profile'],
      targets: ['investor_profile.net_worth'],
      x: ['Net worth'],
    },
    {
      attributes: ['business_kyced_beneficial_owners'],
      targets: [
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.ownership_stake',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.phone_number',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.last_name',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.email',
        'business.beneficial_owners.bo_link_PKMnQ7mCPHcoCwRKTL51ra.id.first_name',
      ],
      x: ['Business beneficial owners'],
    },
  ])('.', ({ attributes, targets, x }) => {
    const eventDataWithDefaults = {
      attributes: attributes,
      targets: targets,
      isPrefill: false,
    } as DataCollectedInfo;
    customRender(<DataCollectedEventHeader data={eventDataWithDefaults} />);
    const header = screen.getByLabelText('Data collected event');
    x.forEach(field => {
      expect(header).toHaveTextContent(field);
    });
    if (x.length <= 2) {
      expect(header).not.toHaveTextContent(',');
    }
  });
});
