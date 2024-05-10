import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind } from '@onefootprint/types';
import React from 'react';

import Provider from '@/entity/hooks/use-entity-context';

import { entityFixture } from '../../../../details.test.config';
import DeviceInsights from './device-insights';
import {
  withCurrentEntityAuthEventsData,
  withCurrentEntityAuthEventsEmpty,
  withCurrentEntityAuthEventsError,
} from './device-insights.test.config';

const useRouterSpy = createUseRouterSpy();
const id = 'fp_id_yCZehsWNeywHnk5JqL20u';

const entity: Entity = { ...entityFixture, kind: EntityKind.person };
const entityWithNoInsightEvent: Entity = { ...entity, workflows: [] };

describe('<DeviceInsights />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/entities',
      query: {
        id,
      },
    });
  });

  const renderDeviceInsights = (enitity: Entity) => {
    customRender(
      <Provider kind={entity.kind} listPath="">
        <DeviceInsights entity={enitity} />
      </Provider>,
    );
  };

  describe('When liveness request fails', () => {
    beforeAll(withCurrentEntityAuthEventsError);

    it('Shows error message when the request fail', async () => {
      renderDeviceInsights(entity);

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('When liveness request passes, but with empty data', () => {
    beforeAll(withCurrentEntityAuthEventsEmpty);

    it('Shows empty device insights if the onboarding is undefined', async () => {
      renderDeviceInsights(entityWithNoInsightEvent);

      await waitFor(() => {
        const emptyMessage = screen.getByText('No device insights available');
        expect(emptyMessage).toBeInTheDocument();
      });
    });

    it('Shows non-empty device insights if the onboarding is defined', async () => {
      renderDeviceInsights(entity);

      await waitFor(() => {
        const ipField = screen.getByText('IP address');
        expect(ipField).toBeInTheDocument();
      });
    });
  });

  describe('When liveness request passes with liveness data', () => {
    beforeAll(withCurrentEntityAuthEventsData);

    it('Shows non-empty device insights even if the onboarding is not defined', async () => {
      renderDeviceInsights(entityWithNoInsightEvent);

      await waitFor(() => {
        const ipField = screen.getByText('IP address');
        expect(ipField).toBeInTheDocument();
      });
    });
  });
});
