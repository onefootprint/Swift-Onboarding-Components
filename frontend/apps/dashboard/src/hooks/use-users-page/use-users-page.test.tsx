import {
  act,
  createUseRouterSpy,
  renderHook,
  waitFor,
  Wrapper,
} from '@onefootprint/test-utils';
import { OnboardingStatus } from '@onefootprint/types';
import React from 'react';

import { UserTimeline } from '../use-user/types';
import { UserStoreProvider } from '../use-user-store';
import useUsersPage from './use-users-page';
import { withMetadataPage } from './use-users-page.test.config';
import useTestHook from './use-users-page-test-hook';

const useRouterSpy = createUseRouterSpy();

type WrapperProps = {
  children: React.ReactNode;
};

const customWrapper = ({ children }: WrapperProps) => (
  <Wrapper>
    <UserStoreProvider>{children}</UserStoreProvider>
  </Wrapper>
);

const PAGE_SIZE = 2;

const renderCustomTestHook = () =>
  renderHook(() => useTestHook(PAGE_SIZE), { wrapper: customWrapper });

const renderUseUsersPage = () =>
  renderHook(() => useUsersPage(PAGE_SIZE), { wrapper: customWrapper });

describe('useUsersPage', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/users',
      query: {},
    });
  });

  describe.skip('when store is empty', () => {
    beforeEach(() => {
      withMetadataPage();
    });

    it('gets page of users', async () => {
      const { result } = renderUseUsersPage();
      await waitFor(() => {
        expect(result.current.isLoading).toEqual(false);
      });
      expect(result.current.totalNumUsers).toEqual(3);
      expect(result.current.pageIndex).toEqual(0);
      expect(result.current.hasNextPage).toEqual(true);
      expect(result.current.hasPrevPage).toEqual(false);
      expect(result.current.users).toStrictEqual([
        {
          metadata: {
            id: 'u1',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: false,
            status: OnboardingStatus.verified,
            onboarding: {
              id: 'id',
              name: 'name',
              configId: 'id',
              requiresManualReview: false,
              status: OnboardingStatus.verified,
              timestamp: 'time',
              isLivenessSkipped: false,
              insightEvent: {
                timestamp: 'time',
              },
              canAccessData: [],
              canAccessDataAttributes: [],
              canAccessIdentityDocumentImages: false,
            },
          },
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
        {
          metadata: {
            id: 'u2',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: true,
            status: OnboardingStatus.failed,
            onboarding: {
              id: 'id',
              name: 'name',
              configId: 'id',
              requiresManualReview: true,
              status: OnboardingStatus.failed,
              timestamp: 'time',
              isLivenessSkipped: false,
              insightEvent: {
                timestamp: 'time',
              },
              canAccessData: [],
              canAccessDataAttributes: [],
              canAccessIdentityDocumentImages: false,
            },
          },
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
        {
          metadata: {
            id: 'u3',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: false,
            status: OnboardingStatus.vaultOnly,
          },
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
      ]);
    });
  });

  describe('when store has existing data', () => {
    beforeEach(() => {
      withMetadataPage();
    });

    it('merges page of users to existing entries in user store', async () => {
      const { result } = renderCustomTestHook();

      const emptyTimeline: UserTimeline = {
        events: [],
      };
      act(() => {
        result.current.userStore.merge({
          userId: 'u1',
          data: { timeline: emptyTimeline },
        });
      });
      expect(result.current.userStore.get('u1')).toStrictEqual({
        timeline: emptyTimeline,
      });

      await waitFor(() => {
        expect(result.current.usersPage.isLoading).toEqual(false);
      });

      expect(result.current.usersPage.totalNumUsers).toEqual(3);
      expect(result.current.usersPage.pageIndex).toEqual(0);
      expect(result.current.usersPage.hasNextPage).toEqual(true);
      expect(result.current.usersPage.hasPrevPage).toEqual(false);
      expect(result.current.usersPage.users).toStrictEqual([
        {
          metadata: {
            id: 'u1',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: false,
            status: OnboardingStatus.verified,
            onboarding: {
              id: 'id',
              name: 'name',
              configId: 'id',
              requiresManualReview: false,
              status: OnboardingStatus.verified,
              timestamp: 'time',
              isLivenessSkipped: false,
              insightEvent: {
                timestamp: 'time',
              },
              canAccessData: [],
              canAccessDataAttributes: [],
              canAccessIdentityDocumentImages: false,
            },
          },
          timeline: emptyTimeline,
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
        {
          metadata: {
            id: 'u2',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: true,
            status: OnboardingStatus.failed,
            onboarding: {
              id: 'id',
              name: 'name',
              configId: 'id',
              requiresManualReview: true,
              status: OnboardingStatus.failed,
              timestamp: 'time',
              isLivenessSkipped: false,
              insightEvent: {
                timestamp: 'time',
              },
              canAccessData: [],
              canAccessDataAttributes: [],
              canAccessIdentityDocumentImages: false,
            },
          },
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
        {
          metadata: {
            id: 'u3',
            isPortable: true,
            identityDataAttributes: [],
            identityDocumentTypes: [],
            startTimestamp: 'time',
            orderingId: 'id',
            requiresManualReview: false,
            status: OnboardingStatus.vaultOnly,
          },
          vaultData: {
            kycData: {},
            idDoc: {},
          },
        },
      ]);
    });
  });
});
