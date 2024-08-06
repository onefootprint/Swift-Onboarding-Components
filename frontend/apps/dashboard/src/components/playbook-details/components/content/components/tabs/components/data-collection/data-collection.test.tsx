import { customRender, screen } from '@onefootprint/test-utils';

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
});
