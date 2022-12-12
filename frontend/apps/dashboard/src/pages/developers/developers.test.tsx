import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import { useStore } from '../../hooks/use-session';
import Developers from './developers';
import { withApiKeys, withOnboardingConfigs } from './developers.test.config';

const originalState = useStore.getState();

describe('<Developers />', () => {
  beforeEach(() => {
    withApiKeys();
    withOnboardingConfigs();
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  const renderDevelopers = () => customRender(<Developers />);

  describe('when is in sandbox mode', () => {
    it('should show a warning message', () => {
      useStore.setState({
        data: {
          auth: '1',
          user: {
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: false,
            name: 'Acme',
            sandboxRestricted: false,
          },
        },
      });

      renderDevelopers();
      const warning = screen.getByText(
        "You're viewing test keys. Disable sandbox mode to view live keys.",
      );
      expect(warning).toBeInTheDocument();
    });

    describe('when its restricted to use only the sandbox mode', () => {
      beforeEach(() => {
        useStore.setState({
          data: {
            auth: '1',
            user: {
              email: 'jane.doe@acme.com',
              firstName: 'Jane',
              lastName: 'Doe',
            },
            org: {
              isLive: false,
              name: 'Acme',
              sandboxRestricted: true,
            },
          },
        });
      });

      it('should disable the toggle and show a tooltip explaining', async () => {
        renderDevelopers();

        const toggle = screen.getByRole('switch') as HTMLButtonElement;
        expect(toggle.disabled).toBeTruthy();
      });
    });

    describe('when toggling', () => {
      beforeEach(() => {
        useStore.setState({
          data: {
            auth: '1',
            user: {
              email: 'jane.doe@acme.com',
              firstName: 'Jane',
              lastName: 'Doe',
            },
            org: {
              isLive: false,
              name: 'Acme',
              sandboxRestricted: false,
            },
          },
        });
      });

      it('should go to the sandbox to the live mode', async () => {
        renderDevelopers();

        const toggle = screen.getByRole('switch');
        await userEvent.click(toggle);

        await waitFor(() => {
          const warning = screen.getByText(
            "You're viewing live keys. Enable sandbox mode to view test keys.",
          );
          expect(warning).toBeInTheDocument();
        });
      });
    });
  });

  describe('when is in live mode', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          auth: '1',
          user: {
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: true,
            name: 'Acme',
            sandboxRestricted: false,
          },
        },
      });
    });

    it('should show an info message', () => {
      renderDevelopers();
      const info = screen.getByText(
        "You're viewing live keys. Enable sandbox mode to view test keys.",
      );
      expect(info).toBeInTheDocument();
    });

    describe('when toggling', () => {
      it('should go to live to the sandbox mode', async () => {
        renderDevelopers();

        const toggle = screen.getByRole('switch');
        await userEvent.click(toggle);

        await waitFor(() => {
          const warning = screen.getByText(
            "You're viewing test keys. Disable sandbox mode to view live keys.",
          );
          expect(warning).toBeInTheDocument();
        });
      });
    });
  });
});
