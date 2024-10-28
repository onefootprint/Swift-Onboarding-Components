import '../../../../config/initializers/react-i18next-test';

import themes from '@onefootprint/design-tokens';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@onefootprint/test-utils';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ProviderReturn } from 'src/components/footprint-provider';
import FootprintProvider from 'src/components/footprint-provider';

import mockRouter from 'next-router-mock';
import Loading from '../loading';
import Content from './content';
import {
  withClientTokenFields,
  withClientTokenFieldsError,
  withClientTokenFieldsExpiredAuthToken,
  withClientTokenFieldsMissingPermissions,
  withSdkArgs,
  withSdkArgsError,
} from './content.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Content />', () => {
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
    mockRouter.setCurrentUrl('/form#tok_testAuthToken');
  });

  it('should show shimmer loading page', async () => {
    renderContent(getMockClient());
    await waitFor(() => {
      expect(screen.getByTestId('init-shimmer')).toBeInTheDocument();
    });
  });

  describe('when fetching sdk args fails', () => {
    beforeEach(() => {
      withSdkArgsError();
      withClientTokenFields();
    });

    it('should show shimmer page while still waiting for post messages', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('init-shimmer')).toBeInTheDocument();
      });
    });
  });
  describe('when auth token is expired', () => {
    beforeEach(() => {
      withSdkArgs();
      withClientTokenFieldsExpiredAuthToken();
    });

    it('should show invalid page', async () => {
      renderContent(getMockClient());
      await waitForElementToBeRemoved(() => screen.queryByTestId('init-shimmer'));
      const invalidForm = await screen.findByTestId('invalid-form', {}, { timeout: 5000 });
      expect(invalidForm).toBeInTheDocument();
    });
  });

  describe('when fetching client token fields fails', () => {
    beforeEach(() => {
      withSdkArgs();
      withClientTokenFieldsError();
    });

    it('should show invalid page', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('invalid-form')).toBeInTheDocument();
      });
    });
  });

  describe('when auth token is missing permissions', () => {
    beforeEach(() => {
      withSdkArgs();
      withClientTokenFieldsMissingPermissions();
    });

    it('should show invalid page', async () => {
      renderContent(getMockClient());
      await waitFor(() => {
        expect(screen.getByTestId('invalid-form')).toBeInTheDocument();
      });
    });
  });
});
