import { createUseRouterSpy, customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import Playbooks from './playbooks';
import { withPlaybooks, withPlaybooksError } from './playbooks.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Playbooks />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/playbooks',
      query: {},
    });
  });

  const renderPlaybooks = () => customRender(<Playbooks />);

  const renderPlaybooksAndWait = async () => {
    renderPlaybooks();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

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
