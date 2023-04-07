import {
  createUseRouterSpy,
  customRender,
  screen,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import AuditTrailTimeline, {
  AuditTrailTimelineProps,
} from './audit-trail-timeline';
import TimelineFixture, { withUser } from './audit-trail-timeline.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<AuditTrailTimeline />', () => {
  const userId = 'fp_id_yCZehsWNeywHnk5JqL20u';

  beforeAll(() => {
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: userId,
      },
    });
  });

  beforeEach(() => {
    withUser(userId);
  });

  const renderAuditTrailTimeline = ({
    timeline,
    isLoading,
  }: AuditTrailTimelineProps) =>
    customRender(
      <AuditTrailTimeline timeline={timeline} isLoading={isLoading} />,
    );

  describe('when loading', () => {
    it('should render the shimmer', () => {
      renderAuditTrailTimeline({ timeline: [], isLoading: true });
      expect(
        screen.getByTestId('audit-trail-timeline-loading'),
      ).toBeInTheDocument();
    });
  });

  describe('when timeline is empty', () => {
    it('should render empty message', () => {
      renderAuditTrailTimeline({ timeline: [] });
      expect(screen.getByText('No entries')).toBeInTheDocument();
    });
  });

  describe('when timeline data is loaded', () => {
    it('should render kyc data collection event correctly', () => {
      renderAuditTrailTimeline({ timeline: TimelineFixture });
      const header = screen.getByTestId('data-collected-event-header');
      expect(header).toBeInTheDocument();
      expect(within(header).getByText('Full name')).toBeInTheDocument();
      expect(within(header).getByText('Date of Birth')).toBeInTheDocument();
      expect(within(header).getByText('SSN (Full)')).toBeInTheDocument();
      expect(within(header).getByText('Address')).toBeInTheDocument();
    });

    it('should render failed onboarding decision event correctly', () => {
      renderAuditTrailTimeline({ timeline: TimelineFixture });
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[1];
      expect(
        within(header).getByText('Could not be verified by Footprint'),
      ).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(2);

      const body = bodies[1];
      expect(within(body).getByText('Step up required')).toBeInTheDocument();
    });

    it('should render verified onboarding decision event correctly', () => {
      renderAuditTrailTimeline({ timeline: TimelineFixture });
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[0];
      expect(
        within(header).getByText('Verified by Footprint'),
      ).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(2);

      const body = bodies[0];
      expect(within(body).getByText('Full name')).toBeInTheDocument();
      expect(within(body).getByText('Date of Birth')).toBeInTheDocument();
      expect(within(body).getByText('SSN (Full)')).toBeInTheDocument();
      expect(within(body).getByText('Address')).toBeInTheDocument();
    });

    // TODO: implement this after the backend finalizes the data model for manual review fields
    // it('should render manual review onboarding decision event correctly', () => {})

    // TODO: implement this tests last - after API/data model iterations are done
    // it('should render id document collection event correctly', () => {});
  });
});
