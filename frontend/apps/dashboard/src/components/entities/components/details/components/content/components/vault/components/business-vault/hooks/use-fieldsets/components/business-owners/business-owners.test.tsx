import { createUseRouterSpy, customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { BusinessOwnersProps } from './business-owners';
import BusinessOwners from './business-owners';
import { entityFixture, withBusinessOwnersError } from './business-owners.test.config';

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

  const renderBusinessOwners = ({ entity = entityFixture }: Partial<BusinessOwnersProps>) =>
    customRender(<BusinessOwners entity={entity} />);

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
