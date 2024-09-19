import { customRender, screen, within } from '@onefootprint/test-utils';
import { DocumentRequestKind, OnboardingConfigKind } from '@onefootprint/types';

import type { KycKybDataCollectionProps } from './kyc-kyb-data-collection';
import KycKybDataCollection from './kyc-kyb-data-collection';
import {
  onboardingConfigFixture,
  playbookFixtureWithBusinessAndKYCDocsFixture,
  playbookFixtureWithKYCForAllBusinessOwnersFixture,
} from './kyc-kyb-data-collection.test.config';

describe('<KycKybDataCollection />', () => {
  const renderDataCollection = ({ playbook = onboardingConfigFixture }: Partial<KycKybDataCollectionProps>) =>
    customRender(<KycKybDataCollection playbook={playbook} />);

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
    describe('when there are no business documents to collect', () => {
      it('should not show the additional docs section', () => {
        renderDataCollection({
          playbook: {
            ...onboardingConfigFixture,
            kind: OnboardingConfigKind.kyb,
            businessDocumentsToCollect: [],
            documentsToCollect: [],
          },
        });

        const additionalDocs = screen.queryByText('Additional docs');
        expect(additionalDocs).not.toBeInTheDocument();
      });

      describe('if there are additional KYC documents to collect', () => {
        it('should show Business Owners additional documents section', () => {
          renderDataCollection({
            playbook: {
              ...onboardingConfigFixture,
              kind: OnboardingConfigKind.kyb,
              documentsToCollect: [
                {
                  kind: DocumentRequestKind.ProofOfSsn,
                  data: {
                    requiresHumanReview: false,
                  },
                },
              ],
            },
          });

          const additionalDocs = screen.getAllByText('Additional docs');
          expect(additionalDocs).toHaveLength(1);
        });
      });
    });

    describe('when there are business documents to collect', () => {
      it('should show Additional docs once if there are only business docs', () => {
        renderDataCollection({
          playbook: {
            ...onboardingConfigFixture,
            kind: OnboardingConfigKind.kyb,
            businessDocumentsToCollect: [
              {
                kind: DocumentRequestKind.Custom,
                data: {
                  name: 'Business License',
                  identifier: 'custom.document.business_license',
                  requiresHumanReview: false,
                },
              },
            ],
            documentsToCollect: [],
          },
        });

        const additionalDocs = screen.getAllByText('Additional docs');
        expect(additionalDocs).toHaveLength(1);
      });

      it('should show Additional docs twice if there are both business and KYC docs', () => {
        renderDataCollection({
          playbook: playbookFixtureWithBusinessAndKYCDocsFixture,
        });

        const additionalDocs = screen.getAllByText('Additional docs');
        expect(additionalDocs).toHaveLength(2);
      });
    });
  });

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

  describe('when there are KYC additional documents', () => {
    it('should show additional documents section', () => {
      renderDataCollection({
        playbook: {
          ...onboardingConfigFixture,
          kind: OnboardingConfigKind.kyc,
          documentsToCollect: [
            {
              kind: DocumentRequestKind.ProofOfSsn,
              data: {
                requiresHumanReview: false,
              },
            },
          ],
        },
      });

      const additionalDocs = screen.getByText('Additional docs');
      expect(additionalDocs).toBeInTheDocument();
    });
  });

  describe('when it does KYC on all the business owners', () => {
    it('should show a check icon', () => {
      renderDataCollection({
        playbook: playbookFixtureWithKYCForAllBusinessOwnersFixture,
      });

      const collectBo = screen.getByRole('row', { name: 'Collect beneficial owners’ information' });
      const check = within(collectBo).getByRole('img', { name: 'Enabled' });
      expect(check).toBeInTheDocument();
    });
  });
});
