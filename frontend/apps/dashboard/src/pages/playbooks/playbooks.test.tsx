import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import Playbooks from './playbooks';
import { withPlaybooks, withPlaybooksError } from './playbooks.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Playbooks />', () => {
  const renderPlaybooks = () => customRender(<Playbooks />);

  const renderPlaybooksAndWait = async () => {
    renderPlaybooks();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isPending = table.getAttribute('aria-busy');
      expect(isPending).toBe('false');
    });
  };

  beforeEach(() => {
    mockRouter.setCurrentUrl('/playbooks');
  });

  describe('when the request to fetch playbooks succeeds', () => {
    beforeEach(() => {
      withPlaybooks();
    });

    it.each([
      [
        {
          name: 'Playbook KYC',
          kind: 'KYC',
          key: 'ob_test_gc1cmZRQoF4MAWGVegTh6T',
        },
        {
          name: 'Playbook KYB',
          kind: 'KYB',
          key: 'ob_test_Y8Uzs96q0DgTehYdKI14f9',
        },
        {
          name: 'Playbook KYC',
          kind: 'Playbook Auth',
          key: 'ob_test_QhzzskOCGDZjvIKNzx91tY',
        },
      ],
    ])('should render the name, kind, key and status', async ({ name, kind, key }) => {
      await renderPlaybooksAndWait();

      const rowName = screen.getByText(name);
      expect(rowName).toBeInTheDocument();

      const rowKind = screen.getByText(kind);
      expect(rowKind).toBeInTheDocument();

      const rowKey = screen.getByText(key);
      expect(rowKey).toBeInTheDocument();
    });
  });

  describe('when the request to fetch playbooks fails', () => {
    beforeEach(() => {
      withPlaybooksError();
    });

    it('should show an error message', async () => {
      renderPlaybooks();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
