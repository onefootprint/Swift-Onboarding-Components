import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import SentilinkDetails from './sentilink-details';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<SentilinkDetails />', () => {
  const renderSentilinkDetails = () => {
    customRender(<SentilinkDetails />);
  };

  beforeEach(() => {
    mockRouter.setCurrentUrl('/users/details');
  });

  describe('isOpen logic', () => {
    it('should open the drawer when risk_signal_id and is_sentilink are in the query params', async () => {
      mockRouter.query = {
        risk_signal_id: 'test-id',
        is_sentilink: 'true',
      };

      renderSentilinkDetails();

      const drawer = await screen.findByRole('dialog', { name: 'Synthetic and ID Theft scores' });
      expect(drawer).toBeInTheDocument();
    });

    it('should not open the drawer when is_sentilink is missing from the query params', async () => {
      mockRouter.query = {
        risk_signal_id: 'test-id',
      };

      renderSentilinkDetails();

      await waitFor(() => {
        const drawer = screen.queryByRole('dialog', { name: 'Synthetic and ID Theft scores' });
        expect(drawer).not.toBeInTheDocument();
      });
    });

    it('should not open the drawer when risk_signal_id is missing from the query params', async () => {
      mockRouter.query = {
        is_sentilink: 'true',
      };

      renderSentilinkDetails();

      await waitFor(() => {
        const drawer = screen.queryByRole('dialog', { name: 'Synthetic and ID Theft scores' });
        expect(drawer).not.toBeInTheDocument();
      });
    });
  });
});
