import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { PersonInformationWithContextProps } from './person.test.config';
import PersonInformationWithContext from './person.test.config';

const renderPerson = ({ startingValues }: PersonInformationWithContextProps) => {
  customRender(<PersonInformationWithContext startingValues={startingValues} />);
};
describe('<Person />', () => {
  describe('when it is a flow for only US residents', () => {
    it('should show a hint', () => {
      renderPerson({
        startingValues: {},
        meta: {
          kind: PlaybookKind.Kyc,
          residency: {
            allowUsResidents: true,
            allowUsTerritories: true,
            allowInternationalResidents: false,
          },
        },
      });

      const hint = screen.getByText("Non U.S. residents aren't allowed to be onboarded.");
      expect(hint).toBeInTheDocument();
    });
  });
});
