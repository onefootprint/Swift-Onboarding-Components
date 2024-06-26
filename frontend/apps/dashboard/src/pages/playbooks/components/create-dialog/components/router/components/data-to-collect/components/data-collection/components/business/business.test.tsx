import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { CollectedKybDataOption } from '@onefootprint/types';
import React from 'react';

import type { BusinessInformationWithContext } from './business.test.config';
import BusinesssInformationWithContext from './business.test.config';

const renderBusinessInformation = ({ startingValues }: BusinessInformationWithContext) => {
  customRender(<BusinesssInformationWithContext startingValues={startingValues} />);
};
describe('<BusinessInformation />', () => {
  it('when removing legal entity type and cancelling, should not save progress', async () => {
    renderBusinessInformation({
      startingValues: {
        [CollectedKybDataOption.corporationType]: true,
        [CollectedKybDataOption.website]: true,
        [CollectedKybDataOption.phoneNumber]: true,
      },
    });
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();

    const edit = screen.getByText('Edit');
    await userEvent.click(edit);
    const legalEntityType = screen.getByRole('switch', {
      name: 'Request users to provide their business legal entity type',
    });
    await userEvent.click(legalEntityType);
    const cancel = screen.getByText('Cancel');
    await userEvent.click(cancel);
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  it('when removing legal entity type and saving, should save progress', async () => {
    renderBusinessInformation({
      startingValues: {
        [CollectedKybDataOption.corporationType]: true,
        [CollectedKybDataOption.website]: true,
        [CollectedKybDataOption.phoneNumber]: true,
      },
    });
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();

    const edit = screen.getByText('Edit');
    await userEvent.click(edit);
    const legalEntityType = screen.getByRole('switch', {
      name: 'Request users to provide their business legal entity type',
    });
    await userEvent.click(legalEntityType);
    const cancel = screen.getByText('Save');
    await userEvent.click(cancel);
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });
});
