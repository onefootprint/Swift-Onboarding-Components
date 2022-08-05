import React from 'react';
import { customRender, screen, userEvent, waitFor } from 'test-utils';

import { useStore } from '../../hooks/use-session-user';
import Developers from './developers';
import { withApiKeys } from './developers.test.config';

const originalState = useStore.getState();

describe('<Developers />', () => {
  beforeEach(() => {
    withApiKeys();
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  const renderDevelopers = () => customRender(<Developers />);

  describe('when is in sandbox mode', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
    });

    it('should show a warning message', () => {
      renderDevelopers();
      const warning = screen.getByText(
        "You're viewing test keys. Disable sandbox mode to view live keys.",
      );
      expect(warning).toBeInTheDocument();
    });

    describe('when toggling', () => {
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
        isLive: true,
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
