import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import AuditTrailTimeline, {
  AuditTrailTimelineProps,
} from './audit-trail-timeline';

describe('<AuditTrailTimeline />', () => {
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
      expect(screen.getByText('No audit trail entries')).toBeInTheDocument();
    });
  });

  // TODO: implement these tests last - after API/data model iterations are done
  // describe('when timeline data is loaded', () => {
  //   it('should render kyc data collection event correctly', () => {});
  //   it('should render id document collection event correctly', () => {});
  //   it('should render onboarding decision event correctly', () => {});
  // });
});
