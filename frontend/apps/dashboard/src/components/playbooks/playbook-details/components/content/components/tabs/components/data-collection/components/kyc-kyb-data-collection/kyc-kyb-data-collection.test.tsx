import { customRender, screen, within } from '@onefootprint/test-utils';

import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { KycKybDataCollectionProps } from './kyc-kyb-data-collection';
import KycKybDataCollection from './kyc-kyb-data-collection';

describe('<KycKybDataCollection />', () => {
  const renderDataCollection = ({ playbook }: KycKybDataCollectionProps) =>
    customRender(<KycKybDataCollection playbook={playbook} />);

  describe('when it has US territories enabled', () => {
    it('should show a note', () => {
      renderDataCollection({
        playbook: {
          ...getOnboardingConfiguration({ kind: 'kyc' }),
          allowUsTerritoryResidents: true,
          documentsToCollect: [],
        },
      });

      const note = screen.getByText('Residents from U.S. territories are allowed to be onboarded');
      expect(note).toBeInTheDocument();
    });
  });

  describe('KYB', () => {
    describe('when there are no business documents to collect', () => {
      it('should not show the additional docs section', () => {
        renderDataCollection({
          playbook: {
            ...getOnboardingConfiguration({ kind: 'kyb' }),
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
              ...getOnboardingConfiguration({ kind: 'kyb' }),
              businessDocumentsToCollect: [],
              documentsToCollect: [
                {
                  kind: 'proof_of_ssn',
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
            ...getOnboardingConfiguration({ kind: 'kyb' }),
            businessDocumentsToCollect: [
              {
                kind: 'custom',
                data: {
                  name: 'Business License',
                  identifier: 'document.custom.*',
                  requiresHumanReview: false,
                  uploadSettings: 'prefer_capture',
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
          playbook: {
            ...getOnboardingConfiguration({ kind: 'kyb' }),
            businessDocumentsToCollect: [
              {
                kind: 'custom',
                data: {
                  name: 'Business license',
                  identifier: 'document.custom.*',
                  requiresHumanReview: false,
                  uploadSettings: 'prefer_upload',
                },
              },
            ],
            documentsToCollect: [
              {
                kind: 'proof_of_address',
                data: {
                  requiresHumanReview: false,
                },
              },
            ],
          },
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
          ...getOnboardingConfiguration({ kind: 'kyb' }),
          businessDocumentsToCollect: [],
          documentsToCollect: [],
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
          ...getOnboardingConfiguration({ kind: 'kyc' }),
          documentsToCollect: [
            {
              kind: 'proof_of_ssn',
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
        playbook: {
          ...getOnboardingConfiguration({ kind: 'kyb' }),
          documentsToCollect: [],
          businessDocumentsToCollect: [],
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
