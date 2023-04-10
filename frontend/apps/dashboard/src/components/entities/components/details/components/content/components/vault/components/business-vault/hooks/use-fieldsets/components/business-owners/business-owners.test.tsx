import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import { BusinessDI } from '@onefootprint/types';
import React from 'react';

import BusinessOwners, { BusinessOwnersProps } from './business-owners';
import {
  entityFixture,
  withBusinessOwnersError,
} from './business-owners.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<BusinessOwners />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: `/businesses/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
  });

  const renderBusinessOwners = ({
    canDecrypt = true,
    disabled = false,
    label = 'Business Owner',
    name = BusinessDI.beneficialOwners,
    showCheckbox = false,
    value = null,
  }: Partial<BusinessOwnersProps>) =>
    customRender(
      <BusinessOwners
        canDecrypt={canDecrypt}
        disabled={disabled}
        label={label}
        name={name}
        showCheckbox={showCheckbox}
        value={value}
      />,
    );

  describe("when the request to fetch the BO's fails", () => {
    beforeEach(() => {
      withBusinessOwnersError();
    });

    it('should show an error message', async () => {
      renderBusinessOwners({});

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
