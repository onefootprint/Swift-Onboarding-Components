import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import type { BusinessOwnersProps } from './business-owners';
import BusinessOwners from './business-owners';
import { entityFixture, withBusinessOwners, withBusinessOwnersError } from './business-owners.test.config';

describe('<BusinessOwners />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/businesses/${entityFixture.id}`);
    mockRouter.query = {
      id: entityFixture.id,
    };
  });

  const renderBusinessOwners = ({ entity = entityFixture }: Partial<BusinessOwnersProps>) => {
    return customRender(<BusinessOwners entity={entity} />);
  };

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

  describe("when the request to fetch the BO's succeeds", () => {
    beforeEach(() => {
      withBusinessOwners();
    });

    it("should show the list of BO's", async () => {
      renderBusinessOwners({});

      const title = await screen.findByRole('list', { name: 'List of business owners' });
      expect(title).toBeInTheDocument();
    });

    describe('when the sum of bos stake is not 100%', () => {
      it('should show message explanining the reason', async () => {
        renderBusinessOwners({});
        await screen.findByRole('list', { name: 'List of business owners' });

        const explanation = screen.getByText(
          "The other 5% is split among 10 small angel investors, so I didn't think it was relevant to add them all here.",
        );
        expect(explanation).toBeInTheDocument();
      });
    });
  });
});
