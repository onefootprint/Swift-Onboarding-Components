import { getEntity, getUserTimeline } from '@onefootprint/fixtures/dashboard';
import { mockRequest, waitFor } from '@onefootprint/test-utils';
import { renderHook } from '@onefootprint/test-utils';
import { EntityStatus, type Entity as EntityT, type TimelineEvent } from '@onefootprint/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAddIncompleteEvents from './use-add-incomplete-events';

const mockTimelineEvent = getUserTimeline({}) as TimelineEvent;
const mockTimeline: TimelineEvent[] = [mockTimelineEvent];
const mockEntity = getEntity({});

export const withBusinessOwners = (boStatus: string) =>
  mockRequest({
    method: 'get',
    path: `/entities/${mockEntity.id}/business_owners`,
    response: [{ name: 'Piip', boStatus }],
  });

const queryClient = new QueryClient();

describe('useAddIncompleteEvents', () => {
  it.each([
    { entityProps: { status: EntityStatus.incomplete, kind: 'person' }, x: 'abandoned' },
    { entityProps: { status: EntityStatus.pass, kind: 'person' }, x: mockTimelineEvent.event.kind },
    { entityProps: { status: EntityStatus.incomplete, kind: 'business' }, boStatus: 'pass', x: 'abandoned' },
    { entityProps: { status: EntityStatus.incomplete, kind: 'business' }, boStatus: 'awaiting_kyc', x: 'awaiting-bos' },
    { entityProps: { status: EntityStatus.pass, kind: 'business' }, x: mockTimelineEvent.event.kind },
  ])('.', async ({ entityProps, boStatus, x }) => {
    withBusinessOwners(boStatus || 'pass');

    const entity = { ...mockEntity, ...entityProps };

    const { result } = renderHook(() => useAddIncompleteEvents(mockTimeline, entity as EntityT), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    await waitFor(() => {
      expect(result.current[0].event.kind).toEqual(x);
    });
  });
});
