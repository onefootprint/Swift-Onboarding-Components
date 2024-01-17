import '../../../../config/initializers/react-i18next-test';

import themes from '@onefootprint/design-tokens';
import {
  createUseRouterSpy,
  render,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import { DesignSystemProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import type { ProviderReturn } from 'src/components/footprint-provider';
import FootprintProvider from 'src/components/footprint-provider';

import Loading from '../loading';
import Content from './content';
import {
  withDecrypt,
  withDecryptError,
  withSdkArgs,
  withSdkArgsError,
} from './content.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Content />', () => {
  const getMockClient = () => ({
    getAdapterResponse: () => null,
    getLoadingStatus: () => false,
    load: jest.fn(() => Promise.resolve()),
    on: jest.fn(() => jest.fn()),
    send: jest.fn(),
  });

  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
  });

  beforeEach(() => {
    useRouterSpy({
      isReady: true,
      pathname: '/form',
      asPath: '/form#tok_testAuthToken',
    });
  });

  const renderContent = (mockFootprint: ProviderReturn) =>
    render(
      <DesignSystemProvider theme={themes.light}>
        <QueryClientProvider client={queryClient}>
          <FootprintProvider client={mockFootprint}>
            <Content fallback={<Loading />} />
          </FootprintProvider>
        </QueryClientProvider>
      </DesignSystemProvider>,
    );

  describe('when there are no sdk args', () => {
    beforeEach(() => {
      withSdkArgsError();
      useRouterSpy({
        isReady: true,
        pathname: '/form',
        asPath: '/form',
      });
    });

    it('should show shimmer loading page', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('init-shimmer')).toBeInTheDocument();
      });
    });
  });

  describe('when fetching sdk args fails', () => {
    beforeEach(() => {
      withSdkArgsError();
      withDecrypt();
    });

    it('should show shimmer page while still waiting for post messages', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('init-shimmer')).toBeInTheDocument();
      });
    });
  });

  describe('when data is decrypted', () => {
    beforeEach(() => {
      withSdkArgs();
      withDecrypt();
    });

    it('shows rendered data', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    });
  });

  describe('when there is an error decrypting the data', () => {
    beforeEach(() => {
      withSdkArgs();
      withDecryptError();
    });

    it('shows invalid page', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('invalid')).toBeInTheDocument();
      });
    });
  });

  describe('when auth token is missing permissions', () => {
    beforeEach(() => {
      withSdkArgs();
      withDecryptError();
    });

    it('should show invalid page', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('invalid')).toBeInTheDocument();
      });
    });
  });
});
