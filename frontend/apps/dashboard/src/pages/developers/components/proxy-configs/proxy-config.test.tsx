import {
  createFileSaverSpy,
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import {
  proxyConfigDetailsFixture,
  proxyConfigsFixture,
  withProxyConfigDetails,
  withProxyConfigs,
  withProxyConfigsError,
} from './proxy-config.test.config';
import ProxyConfigs from './proxy-configs';

const useRouterSpy = createUseRouterSpy();
const fileSaverSpy = createFileSaverSpy();

describe('<ProxyConfigs />', () => {
  const fileSaverMock = fileSaverSpy();

  beforeEach(() => {
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'proxy-configs',
      },
    });
  });

  beforeEach(() => {
    withProxyConfigs();
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

    it('should render the name and email of each member', async () => {
      await renderProxyConfigsAndWaitData();

      proxyConfigsFixture.forEach(proxyConfig => {
        const name = screen.getByText(proxyConfig.name);
        expect(name).toBeInTheDocument();

        const url = screen.getByText(proxyConfig.url);
        expect(url).toBeInTheDocument();

        const method = screen.getByText(proxyConfig.method);
        expect(method).toBeInTheDocument();
      });
    });

    describe('when clicking on the row', () => {
      it('should append the proxy_config_id to the query params', async () => {
        const push = jest.fn();
        useRouterSpy({
          push,
          pathname: '/developers',
          query: {
            tab: 'proxy-configs',
          },
        });

        await renderProxyConfigsAndWaitData();

        const firstRow = screen.getByRole('row', {
          name: new RegExp(proxyConfigsFixture[0].name),
        });
        firstRow.click();

        expect(push).toHaveBeenCalledWith(
          {
            query: {
              tab: 'proxy-configs',
              proxy_config_id: proxyConfigsFixture[0].id,
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('when it has a proxy_config_id in the query params', () => {
      describe('when the request to fetch the proxy config details succeeds', () => {
        beforeEach(() => {
          withProxyConfigDetails(proxyConfigDetailsFixture.id);
        });

        it('should show the details of the proxy config', async () => {
          useRouterSpy({
            pathname: '/developers',
            query: {
              tab: 'proxy-configs',
              proxy_config_id: proxyConfigDetailsFixture.id,
            },
          });

          await renderProxyConfigsAndWaitData();

          const urlRow = screen.getByRole('row', {
            name: 'URL',
          });
          const urlValue = within(urlRow).getByText(
            proxyConfigDetailsFixture.url,
          );
          expect(urlValue).toBeInTheDocument();

          const httpRow = screen.getByRole('row', {
            name: 'HTTP Method',
          });
          const httpValue = within(httpRow).getByText(
            proxyConfigDetailsFixture.method,
          );
          expect(httpValue).toBeInTheDocument();

          const accessReasonRow = screen.getByRole('row', {
            name: 'Access reason',
          });
          const accessReasonValue = within(accessReasonRow).getByText(
            proxyConfigDetailsFixture.accessReason,
          );
          expect(accessReasonValue).toBeInTheDocument();

          proxyConfigDetailsFixture.secretHeaders.forEach(header => {
            const headerName = screen.getByText(header.name);
            expect(headerName).toBeInTheDocument();
          });

          proxyConfigDetailsFixture.headers.forEach(header => {
            const headerName = screen.getByText(header.name);
            expect(headerName).toBeInTheDocument();

            const headerValue = screen.getByText(header.value);
            expect(headerValue).toBeInTheDocument();
          });

          const download = screen.getByRole('button', {
            name: 'Download client certificate',
          });
          await userEvent.click(download);
          expect(fileSaverMock).toHaveBeenCalledWith(
            {
              content: expect.anything(),
              options: {
                type: 'text/plain;charset=utf-8',
              },
            },
            'name-of-the-proxy-config-client-certificate.crt',
          );

          const downloadPinnedServerCertificate = screen.getByRole('button', {
            name: 'Download pinned server certificate',
          });
          await userEvent.click(downloadPinnedServerCertificate);
          expect(fileSaverMock).toHaveBeenCalledWith(
            {
              content: expect.anything(),
              options: {
                type: 'text/plain;charset=utf-8',
              },
            },
            'name-of-the-proxy-config-pinned-server-certificate.crt',
          );

          const contentTypeRow = screen.getByRole('row', {
            name: 'Content type',
          });
          const contentTypeValue = within(contentTypeRow).getByText(
            proxyConfigDetailsFixture.ingressContentType,
            { exact: false },
          );
          expect(contentTypeValue).toBeInTheDocument();

          proxyConfigDetailsFixture.ingressRules.forEach(rule => {
            const ruleToken = screen.getByText(rule.token);
            expect(ruleToken).toBeInTheDocument();

            const ruleTarget = screen.getByText(rule.target);
            expect(ruleTarget).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('when the request to fetch the proxy configs fails', () => {
    beforeEach(() => {
      withProxyConfigsError();
    });

    it('should render an error message', async () => {
      renderProxyConfigs();

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
