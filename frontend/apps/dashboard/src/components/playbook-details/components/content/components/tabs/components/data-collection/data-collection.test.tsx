import { customRender, screen, within } from '@onefootprint/test-utils';
import { OnboardingConfigKind } from '@onefootprint/types';

import type { DataCollectionProps } from './data-collection';
import DataCollection from './data-collection';
import onboardingConfigFixture from './data-collection.test.config';

describe('<DataCollection />', () => {
  const renderDataCollection = ({ playbook = onboardingConfigFixture }: Partial<DataCollectionProps>) =>
    customRender(<DataCollection playbook={playbook} />);

  describe('when it has US territories enabled', () => {
    it('should show a note', () => {
      renderDataCollection({
        playbook: {
          ...onboardingConfigFixture,
          allowUsTerritoryResidents: true,
        },
      });

      const note = screen.getByText('Residents from U.S. territories are allowed to be onboarded.');
      expect(note).toBeInTheDocument();
    });
  });

  describe('KYB', () => {
    describe('when it does KYC only for the primary business owner', () => {
      it('should show a check icon', () => {
        renderDataCollection({
          playbook: {
            ...onboardingConfigFixture,
            kind: OnboardingConfigKind.kyb,
            mustCollectData: [
              'email',
              'name',
              'dob',
              'full_address',
              'phone_number',
              'ssn9',
              'business_name',
              'business_tin',
              'business_kyced_beneficial_owners',
              'business_address',
            ],
          },
        });

        const collectBo = screen.getByRole('row', { name: 'Collect beneficial owners’ information' });
        const check = within(collectBo).getByRole('img', { name: 'Enabled' });
        expect(check).toBeInTheDocument();
      });
    });

    describe('when it does KYC on all the business owners', () => {
      it('should show a check icon', () => {
        renderDataCollection({
          playbook: {
            ...onboardingConfigFixture,
            kind: OnboardingConfigKind.kyb,
            mustCollectData: [
              'email',
              'name',
              'dob',
              'full_address',
              'phone_number',
              'ssn9',
              'business_name',
              'business_tin',
              'business_beneficial_owners',
              'business_address',
            ],
          },
        });

        const collectBo = screen.getByRole('row', { name: 'Collect beneficial owners’ information' });
        const check = within(collectBo).getByRole('img', { name: 'Enabled' });
        expect(check).toBeInTheDocument();
      });
    });
  });
});
