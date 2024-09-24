import { customRender, mockRouter, screen, waitFor } from '@onefootprint/test-utils';
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

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<ProxyConfigs />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/proxy-configs');
  });

  const renderProxyConfigs = () => customRender(<ProxyConfigs />);

  const renderProxyConfigsAndWaitData = async () => {
    renderProxyConfigs();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isPending = table.getAttribute('aria-busy');
      expect(isPending).toBe('false');
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
        await renderProxyConfigsAndWaitData();

        const firstRow = screen.getByRole('row', {
          name: proxyConfigDetailsFixture.name,
        });
        firstRow.click();

        expect(mockRouter).toMatchObject({
          query: {
            proxy_config_id: proxyConfigDetailsFixture.id,
          },
        });
      });
    });

    describe('when it has a proxy_config_id in the query params', () => {
      beforeEach(() => {
        mockRouter.setCurrentUrl('/proxy-configs');
        mockRouter.query = {
          proxy_config_id: proxyConfigDetailsFixture.id,
        };
      });

      beforeEach(() => {
        withProxyConfigDetails(proxyConfigDetailsFixture.id);
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
