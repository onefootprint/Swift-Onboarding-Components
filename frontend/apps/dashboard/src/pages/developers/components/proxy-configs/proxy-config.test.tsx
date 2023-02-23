import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import {
  proxyConfigsFixture,
  withProxyConfigs,
  withProxyConfigsError,
} from './proxy-config.test.config';
import ProxyConfigs from './proxy-configs';

const useRouterSpy = createUseRouterSpy();

describe('<ProxyConfigs />', () => {
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
  });
});
