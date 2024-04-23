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
import { withEntity } from 'src/components/entities/components/details/details.test.config';
import { asAdminUser } from 'src/config/tests';

import AuditTrailTimeline from './audit-trail-timeline';
import {
  DocumentWorkflowStarted,
  entityFixture,
  entityIdFixure,
  obcIdFixture,
  TimelineFixture,
  withRuleSetResult,
  WorkflowTriggeredWithLinkEvent,
} from './audit-trail-timeline.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<AuditTrailTimeline />', () => {
  beforeEach(() => {
    withEntity(entityFixture);
    useRouterSpy({
      pathname: `/entities/${entityIdFixure}`,
      query: {
        id: entityIdFixure,
      },
    });
    withRuleSetResult();
    asAdminUser();
  });

  const renderAuditTrailTimeline = (timeline: TimelineEvent[]) =>
    customRender(
      <AuditTrailTimeline entity={entityFixture} timeline={timeline} />,
    );

  describe('when timeline data is loaded', () => {
    it('should render label added event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const header = screen.getByTestId('label-added-event-header');
      expect(header).toBeInTheDocument();
      expect(within(header).getByText('Labeled as')).toBeInTheDocument();
      expect(within(header).getByText('Active')).toBeInTheDocument();
    });

    it('should render kyc data collection event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const header = screen.getByTestId('data-collected-event-header');
      expect(header).toBeInTheDocument();
      expect(
        within(header).getByText(
          'Full name, Email, Address, Date of birth, Phone number, SSN (Full)',
        ),
      ).toBeInTheDocument();
    });

    it('should render failed onboarding decision event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[1];
      expect(within(header).getByText('Completed')).toBeInTheDocument();
      expect(within(header).getByText('My Playbook')).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(1);

      const body = bodies[0];
      expect(within(body).getByText('Step up required')).toBeInTheDocument();
    });

    it('should render verified onboarding decision event correctly', () => {
      renderAuditTrailTimeline(TimelineFixture);
      const headers = screen.getAllByTestId('onboarding-decision-event-header');
      expect(headers.length).toEqual(2);

      const header = headers[0];
      expect(
        within(header).getByText('Successfully completed'),
      ).toBeInTheDocument();
      expect(within(header).getByText('My Playbook')).toBeInTheDocument();

      const bodies = screen.getAllByTestId('onboarding-decision-event-body');
      expect(bodies.length).toEqual(1);
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
        screen.getByText('requested user to upload ID photo'),
      ).toBeInTheDocument();

      const body = screen.getByTestId('workflow-triggered-event-body');
      expect(body).toBeInTheDocument();
      expect(
        within(body).getByText(
          'Generated a link for the user to complete this task',
        ),
      ).toBeInTheDocument();
      expect(
        within(body).queryByText('Create new link'),
      ).not.toBeInTheDocument();
    });

    describe('when rendering workflow trigger event with link', () => {
      it('should be able to generate a new link', async () => {
        const { writeTestMockFn } = createClipboardSpy();
        mockRequest({
          method: 'get',
          path: `/org/onboarding_configs/${obcIdFixture}`,
          response: { name: 'My playbook' },
        });
        mockRequest({
          method: 'post',
          path: `/entities/${entityIdFixure}/token`,
          response: { link: 'https://mylink' },
        });

        renderAuditTrailTimeline([WorkflowTriggeredWithLinkEvent]);
        expect(
          screen.getByText('Piip Penguin (piip@onefootprint.com)'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('requested user to onboard onto'),
        ).toBeInTheDocument();
        await waitFor(() => {
          expect(screen.getByText('My playbook')).toBeInTheDocument();
        });

        const body = screen.getByTestId('workflow-triggered-event-body');
        expect(body).toBeInTheDocument();
        expect(
          within(body).getByText(
            'Generated a link for the user to complete this task',
          ),
        ).toBeInTheDocument();
        const createLinkButton = within(body).getByText('Create new link');
        expect(createLinkButton).toBeInTheDocument();
        await userEvent.click(createLinkButton);

        await waitFor(() => {
          expect(
            screen.getByDisplayValue('https://mylink'),
          ).toBeInTheDocument();
        });
        const copyButton = screen.getByText('Copy link');
        await userEvent.click(copyButton);

        await waitFor(() => {
          expect(writeTestMockFn).toHaveBeenCalledWith('https://mylink');
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
