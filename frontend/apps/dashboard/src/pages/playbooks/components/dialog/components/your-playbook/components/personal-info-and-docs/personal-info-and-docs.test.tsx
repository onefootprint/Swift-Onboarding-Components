import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import PersonalInfoAndDocsWithContext, {
  type PersonalInfoAndDocsWithContextProps,
} from './personal-info-and-docs.test.config';

const renderPersonalInfoAndDocs = ({
  startingValues,
}: PersonalInfoAndDocsWithContextProps) => {
  customRender(
    <PersonalInfoAndDocsWithContext startingValues={startingValues} />,
  );
};
describe('<PersonalInfoAndDocs />', () => {
  it('when adding new ID doc selection and cancelling, should not save progress', async () => {
    renderPersonalInfoAndDocs({
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
});
