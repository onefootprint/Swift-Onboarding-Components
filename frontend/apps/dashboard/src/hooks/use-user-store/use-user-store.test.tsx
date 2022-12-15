import { act, renderHook, Wrapper } from '@onefootprint/test-utils';
import {
  IdDocDataAttribute,
  IdDocType,
  OnboardingStatus,
  TimelineEventKind,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';

import {
  UserAnnotations,
  UserMetadata,
  UserTimeline,
  UserVaultData,
} from '../use-user/types';
import useUserStore, { UserStoreProvider } from './use-user-store';

type WrapperProps = {
  children: React.ReactNode;
};

describe('useUserStore', () => {
  const customWrapper = ({ children }: WrapperProps) => (
    <Wrapper>
      <UserStoreProvider>{children}</UserStoreProvider>
    </Wrapper>
  );

  const renderUseUserStore = () =>
    renderHook(() => useUserStore(), { wrapper: customWrapper });

  it('when store is empty', () => {
    const { result } = renderUseUserStore();
    expect(result.current.getAll()).toStrictEqual([]);
    expect(result.current.get('id')).toStrictEqual(undefined);
  });

  it('gets stored users', () => {
    const { result } = renderUseUserStore();
    expect(result.current.get('u1')).toStrictEqual(undefined);

    act(() => {
      result.current.merge({ userId: 'u1', data: {} });
    });
    expect(result.current.get('u1')).toStrictEqual({});

    const emptyTimeline: UserTimeline = {
      events: [],
    };
    act(() => {
      result.current.merge({ userId: 'u1', data: { timeline: emptyTimeline } });
    });
    expect(result.current.get('u1')).toStrictEqual({ timeline: emptyTimeline });

    const timelineWithData: UserTimeline = {
      events: [
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              idDocKind: IdDocType.idCard,
            },
          },
          timestamp: 'time',
        },
      ],
    };
    act(() => {
      result.current.merge({
        userId: 'u1',
        data: { timeline: timelineWithData },
      });
    });
    expect(result.current.get('u1')).toStrictEqual({
      timeline: timelineWithData,
    });

    const emptyAnnotations: UserAnnotations = {
      annotations: [],
    };
    act(() => {
      result.current.merge({
        userId: 'u1',
        data: { annotations: emptyAnnotations },
      });
    });
    expect(result.current.get('u1')).toStrictEqual({
      annotations: emptyAnnotations,
      timeline: timelineWithData,
    });

    const user1Metadata: UserMetadata = {
      requiresManualReview: false,
      status: OnboardingStatus.failed,
      id: 'u1',
      isPortable: true,
      identityDataAttributes: [],
      identityDocumentTypes: [],
      startTimestamp: 'time',
      orderingId: 'id',
    };
    act(() => {
      result.current.merge({ userId: 'u1', data: { metadata: user1Metadata } });
    });
    expect(result.current.get('u1')).toStrictEqual({
      annotations: emptyAnnotations,
      timeline: timelineWithData,
      metadata: user1Metadata,
    });

    const user2Metadata: UserMetadata = {
      requiresManualReview: false,
      status: OnboardingStatus.failed,
      id: 'u2',
      isPortable: true,
      identityDataAttributes: [],
      identityDocumentTypes: [],
      startTimestamp: 'time',
      orderingId: 'id',
    };
    act(() => {
      result.current.merge({ userId: 'u2', data: { metadata: user2Metadata } });
    });
    expect(result.current.get('u2')).toStrictEqual({ metadata: user2Metadata });

    expect(result.current.getAll()).toStrictEqual([
      {
        annotations: emptyAnnotations,
        timeline: timelineWithData,
        metadata: user1Metadata,
      },
      { metadata: user2Metadata },
    ]);

    act(() => {
      result.current.clear();
    });
    expect(result.current.getAll()).toStrictEqual([]);
  });

  it('updates vault data correctly', () => {
    const { result } = renderUseUserStore();
    const emptyVaultData: UserVaultData = {
      kycData: {},
      idDoc: {},
    };
    act(() => {
      result.current.merge({
        userId: 'u1',
        data: { vaultData: emptyVaultData },
      });
    });
    expect(result.current.get('u1')).toStrictEqual({
      vaultData: emptyVaultData,
    });

    const kycData: UserVaultData = {
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
      },
      idDoc: {},
    };
    act(() => {
      result.current.merge({ userId: 'u1', data: { vaultData: kycData } });
    });
    expect(result.current.get('u1')).toStrictEqual({ vaultData: kycData });

    const updatedKycData: UserVaultData = {
      kycData: {
        [UserDataAttribute.lastName]: 'Footprint',
      },
      idDoc: {},
    };
    act(() => {
      result.current.merge({
        userId: 'u1',
        data: { vaultData: updatedKycData },
      });
    });
    expect(result.current.get('u1')).toStrictEqual({
      vaultData: {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {},
      },
    });

    const overwriteKycData: UserVaultData = {
      kycData: {
        [UserDataAttribute.lastName]: 'Footprint 2',
      },
      idDoc: {},
    };
    act(() => {
      result.current.merge({
        userId: 'u1',
        data: { vaultData: overwriteKycData },
      });
    });
    expect(result.current.get('u1')).toStrictEqual({
      vaultData: {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint 2',
        },
        idDoc: {},
      },
    });

    const idDoc: UserVaultData = {
      kycData: {},
      idDoc: {
        [IdDocDataAttribute.frontImage]: 'image',
      },
    };
    act(() => {
      result.current.merge({ userId: 'u1', data: { vaultData: idDoc } });
    });
    expect(result.current.get('u1')).toStrictEqual({
      vaultData: {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint 2',
        },
        idDoc: {
          [IdDocDataAttribute.frontImage]: 'image',
        },
      },
    });
  });
});
