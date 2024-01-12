import {
  createClipboardSpy,
  createUseRouterSpy,
  customRender,
  mockRequest,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import type { TimelineEvent } from '@onefootprint/types';
import React from 'react';
import { entityFixture } from 'src/components/entities/components/details/details.test.config';

import AuditTrailTimeline from './audit-trail-timeline';
import {
  DocumentWorkflowStarted,
  entityIdFixure,
  TimelineFixture,
  withRuleSetResult,
  WorkflowTriggeredWithLinkEvent,
} from './audit-trail-timeline.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<AuditTrailTimeline />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: `/entities/${entityIdFixure}`,
      query: {
        id: entityIdFixure,
      },
    });
    withRuleSetResult();
  });

  const renderAuditTrailTimeline = (timeline: TimelineEvent[]) =>
    customRender(
      <AuditTrailTimeline entity={entityFixture} timeline={timeline} />,
    );

  describe('when timeline data is loaded', () => {
    it('should render kyc data collection event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const header = screen.getByTestId('data-collected-event-header');
      expect(header).toBeInTheDocument();
      expect(within(header).getByText('Full name')).toBeInTheDocument();
      expect(within(header).getByText('Date of birth')).toBeInTheDocument();
      expect(within(header).getByText('SSN (Full)')).toBeInTheDocument();
      expect(within(header).getByText('Address')).toBeInTheDocument();
    });

    it('should render failed onboarding decision event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[1];
      expect(
        within(header).getByText('Could not be verified by'),
      ).toBeInTheDocument();
      expect(within(header).getByText('Footprint')).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(2);

      const body = bodies[1];
      expect(within(body).getByText('Step up required')).toBeInTheDocument();
    });

    it('should render verified onboarding decision event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[0];
      expect(within(header).getByText('Verified by')).toBeInTheDocument();
      expect(within(header).getByText('Footprint')).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(2);

      const body = bodies[0];
      expect(within(body).getByText('Full name')).toBeInTheDocument();
      expect(within(body).getByText('Date of birth')).toBeInTheDocument();
      expect(within(body).getByText('SSN (Full)')).toBeInTheDocument();
      expect(within(body).getByText('Address')).toBeInTheDocument();

      const playbookBodies = screen.getAllByTestId(
        'onboarding-decision-playbook-body',
      );
      expect(playbookBodies.length).toEqual(2);
      expect(
        within(playbookBodies[0]).getByText('Onboarded onto'),
      ).toBeInTheDocument();
      expect(
        within(playbookBodies[0]).getByText('My Playbook'),
      ).toBeInTheDocument();
    });

    it('should render vault created onboarding decision properly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      expect(screen.getByText('User created by')).toBeInTheDocument();
      expect(screen.getByText('Production key')).toBeInTheDocument();
    });

    it('should render workflow trigger event properly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      expect(
        screen.getByText('Piip Penguin (piip@onefootprint.com)'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('requested user to upload ID photo with a note'),
      ).toBeInTheDocument();

      const note = screen.getByTestId('workflow-triggered-event-body-note');
      expect(
        within(note).getByText('"Hello today, please upload your flerpderp"'),
      ).toBeInTheDocument();

      const body = screen.getByTestId('workflow-triggered-event-body');
      expect(body).toBeInTheDocument();
      expect(
        within(body).getByText('User received a link to complete this task'),
      ).toBeInTheDocument();
      expect(within(body).queryByText('Copy link')).not.toBeInTheDocument();
    });

    describe('when rendering workflow trigger event with link', () => {
      it('should be able to click link', async () => {
        const { writeTestMockFn } = createClipboardSpy();
        mockRequest({
          method: 'post',
          path: '/entities/fp_bid_VXND11zUVRYQKKUxbUN3KD/triggers/wfr_id/link',
          response: { link: 'https://mylink' },
        });

        renderAuditTrailTimeline([WorkflowTriggeredWithLinkEvent]);
        expect(
          screen.getByText('Piip Penguin (piip@onefootprint.com)'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('requested user to revise KYC data'),
        ).toBeInTheDocument();

        const body = screen.getByTestId('workflow-triggered-event-body');
        expect(body).toBeInTheDocument();
        expect(
          within(body).getByText('User received a link to complete this task'),
        ).toBeInTheDocument();
        const copyButton = within(body).getByText('Copy link');
        expect(copyButton).toBeInTheDocument();

        await userEvent.click(copyButton);

        await waitFor(() => {
          expect(writeTestMockFn).toHaveBeenCalledWith('https://mylink');
        });

        // Should show confirmation of copy
        await waitFor(() => {
          const confirmationTooltip = within(body).getByRole('tooltip', {
            name: 'Copied!',
          });
          expect(confirmationTooltip).toBeInTheDocument();
        });

        // And the confirmation should go away
        await waitFor(() => {
          const confirmationTooltip = within(body).queryByRole('tooltip', {
            name: 'Copied!',
          });
          expect(confirmationTooltip).not.toBeInTheDocument();
        });
      });

      it('should handle link error', async () => {
        // Simulate an error generating the link
        mockRequest({
          method: 'post',
          path: '/entities/fp_bid_VXND11zUVRYQKKUxbUN3KD/triggers/wfr_id/link',
          statusCode: 400,
          response: {},
        });

        renderAuditTrailTimeline([WorkflowTriggeredWithLinkEvent]);

        const body = screen.getByTestId('workflow-triggered-event-body');
        const copyButton = within(body).getByText('Copy link');
        expect(copyButton).toBeInTheDocument();
        await userEvent.click(copyButton);

        // Should show confirmation of error
        await waitFor(() => {
          const confirmationTooltip = within(body).getByRole('tooltip', {
            name: `Couldn't copy...`,
          });
          expect(confirmationTooltip).toBeInTheDocument();
        });
      });
    });

    it('should render workflow started event properly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      expect(screen.getByText('Started onboarding onto')).toBeInTheDocument();
    });

    it('should render document workflow started event properly', () => {
      renderAuditTrailTimeline([DocumentWorkflowStarted]);
      expect(
        screen.getByText('Started uploading document'),
      ).toBeInTheDocument();
    });

    // TODO: implement this after the backend finalizes the data model for manual review fields
    // it('should render manual review onboarding decision event correctly', () => {})

    // TODO: implement this tests last - after API/data model iterations are done
    // it('should render id document collection event correctly', () => {});
  });
});
