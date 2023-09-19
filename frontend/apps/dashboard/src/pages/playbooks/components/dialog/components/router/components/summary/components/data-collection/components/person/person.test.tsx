import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { PersonInformationWithContextProps } from './person.test.config';
import PersonInformationWithContext from './person.test.config';

const renderPerson = ({
  startingValues,
}: PersonInformationWithContextProps) => {
  customRender(
    <PersonInformationWithContext startingValues={startingValues} />,
  );
};
describe('<Person />', () => {
  it('when adding new ID doc selection and cancelling, should not save progress', async () => {
    renderPerson({
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });
    const edit = screen.getByText('Edit');
    await userEvent.click(edit);
    const idCard = screen.getByRole('checkbox', {
      name: 'Identity card',
    });
    await userEvent.click(idCard);
    const cancel = screen.getByText('Cancel');
    await userEvent.click(cancel);

    expect(screen.getByText("Driver's license")).toBeInTheDocument();
    expect(
      screen.queryByText("Driver's license, Identity card"),
    ).not.toBeInTheDocument();
  });

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

      const hint = screen.getByText(
        "Non U.S. residents aren't allowed to be onboarded.",
      );
      expect(hint).toBeInTheDocument();
    });
  });
});
