import { createUseRouterSpy, customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { clickOnAction } from 'src/config/tests';

import {
  proxyConfigDetailsFixture,
  proxyConfigsFixture,
  withEditProxyConfig,
  withEditProxyConfigError,
  withProxyConfigDetails,
  withProxyConfigs,
  withProxyConfigsError,
  withRemoveProxyConfig,
  withRemoveProxyConfigError,
} from './proxy-config.test.config';
import ProxyConfigs from './proxy-configs';

const useRouterSpy = createUseRouterSpy();

describe('<ProxyConfigs />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/proxy-configs',
      query: {},
    });
  });

  const renderProxyConfigs = () => customRender(<ProxyConfigs />);

  const renderProxyConfigsAndWaitData = async () => {
    renderProxyConfigs();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the proxy configs succeeds', () => {
    beforeEach(() => {
      withProxyConfigs();
    });

    it('should show the name and email of each proxy config', async () => {
      await renderProxyConfigsAndWaitData();

      proxyConfigsFixture.forEach(proxyConfig => {
        const id = screen.getByText(proxyConfig.id);
        expect(id).toBeInTheDocument();

        const name = screen.getByText(proxyConfig.name);
        expect(name).toBeInTheDocument();

        const url = screen.getByText(proxyConfig.url);
        expect(url).toBeInTheDocument();

        const method = screen.getByText(proxyConfig.method);
        expect(method).toBeInTheDocument();
      });
    });

    describe('when clicking on the proxy config row', () => {
      it('should append the proxy_config_id to the query params', async () => {
        const push = jest.fn();
        useRouterSpy({
          push,
          pathname: '/proxy-configs',
          query: {},
        });

        await renderProxyConfigsAndWaitData();

        const firstRow = screen.getByRole('row', {
          name: proxyConfigDetailsFixture.name,
        });
        firstRow.click();

        expect(push).toHaveBeenCalledWith(
          {
            query: {
              proxy_config_id: proxyConfigDetailsFixture.id,
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('when it has a proxy_config_id in the query params', () => {
      beforeEach(() => {
        withProxyConfigDetails(proxyConfigDetailsFixture.id);
        useRouterSpy({
          pathname: '/proxy-configs',
          query: {
            proxy_config_id: proxyConfigDetailsFixture.id,
          },
        });
      });

      it('should show the proxy config details', async () => {
        await renderProxyConfigsAndWaitData();

        await waitFor(() => {
          const details = screen.getByRole('dialog', {
            name: proxyConfigDetailsFixture.name,
          });
          expect(details).toBeInTheDocument();
        });
      });
    });

    describe('when disabling a proxy config', () => {
      describe('when the request to disable the proxy config fails', () => {
        beforeEach(() => {
          withEditProxyConfigError(proxyConfigDetailsFixture);
        });

        it('should show an error message', async () => {
          await renderProxyConfigsAndWaitData();
          await clickOnAction({
            triggerLabel: `Open actions for proxy config ${proxyConfigDetailsFixture.name}`,
            actionText: 'Disable',
            confirmationDialogName: 'Disable proxy config',
          });

          await waitFor(() => {
            const feedback = screen.getByText('Something went wrong');
            expect(feedback).toBeInTheDocument();
          });
        });
      });

      describe('when the request to disable the proxy config succeeds', () => {
        beforeEach(() => {
          withEditProxyConfig(proxyConfigDetailsFixture, {
            status: 'disabled',
          });
        });

        it('should update the status of the proxy config', async () => {
          await renderProxyConfigsAndWaitData();
          await clickOnAction({
            triggerLabel: `Open actions for proxy config ${proxyConfigDetailsFixture.name}`,
            actionText: 'Disable',
            confirmationDialogName: 'Disable proxy config',
          });

          withProxyConfigs([
            {
              ...proxyConfigDetailsFixture,
              status: 'disabled',
            },
          ]);

          await waitFor(() => {
            const feedback = screen.getByText('Vault proxy configuration updated');
            expect(feedback).toBeInTheDocument();
          });

          await waitFor(() => {
            const status = screen.getByText('Disabled');
            expect(status).toBeInTheDocument();
          });
        });
      });
    });

    describe('when removing a proxy config', () => {
      describe('when the request to remove the proxy config fails', () => {
        beforeEach(() => {
          withRemoveProxyConfigError(proxyConfigDetailsFixture);
        });

        it('should show an error message', async () => {
          await renderProxyConfigsAndWaitData();
          await clickOnAction({
            triggerLabel: `Open actions for proxy config ${proxyConfigDetailsFixture.name}`,
            actionText: 'Remove',
            confirmationDialogName: 'Remove proxy config',
          });

          await waitFor(() => {
            const feedback = screen.getByText('Something went wrong');
            expect(feedback).toBeInTheDocument();
          });
        });
      });

      describe('when the request to remove the proxy config succeeds', () => {
        beforeEach(() => {
          withRemoveProxyConfig(proxyConfigDetailsFixture);
        });

        it('should remove the proxy config', async () => {
          await renderProxyConfigsAndWaitData();
          await clickOnAction({
            triggerLabel: `Open actions for proxy config ${proxyConfigDetailsFixture.name}`,
            actionText: 'Remove',
            confirmationDialogName: 'Remove proxy config',
          });
          withProxyConfigs([]);

          await waitFor(() => {
            const feedback = screen.getByText('Vault proxy configuration removed');
            expect(feedback).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('when the request to fetch the proxy configs fails', () => {
    beforeEach(() => {
      withProxyConfigsError();
    });

    it('should show an error message', async () => {
      renderProxyConfigs();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
