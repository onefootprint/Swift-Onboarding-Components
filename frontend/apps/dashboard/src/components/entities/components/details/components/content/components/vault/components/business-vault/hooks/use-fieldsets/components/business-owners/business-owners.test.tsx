import { customRender, mockRouter, screen, waitFor } from '@onefootprint/test-utils';

import type { BusinessOwnersProps } from './business-owners';
import BusinessOwners from './business-owners';
import { entityFixture, withBusinessOwnersError } from './business-owners.test.config';

describe('<BusinessOwners />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/businesses/${entityFixture.id}`);
    mockRouter.query = {
      id: entityFixture.id,
    };
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
