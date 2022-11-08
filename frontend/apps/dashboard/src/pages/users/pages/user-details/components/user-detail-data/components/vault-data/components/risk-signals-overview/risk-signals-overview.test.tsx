import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';
import React from 'react';

import RiskSignalsOverview, {
  RiskSignalsOverviewProps,
} from './risk-signals-overview';

const useRouterSpy = createUseRouterSpy();

describe('<RiskSignalsOverview />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/users/detail', query: {} });
  });

  const renderRiskSignalsOverview = ({
    high,
    medium,
    low,
  }: RiskSignalsOverviewProps) =>
    customRender(<RiskSignalsOverview high={high} medium={medium} low={low} />);

  describe('when there are no risks', () => {
    it('should render an empty state message', () => {
      renderRiskSignalsOverview({ high: [], medium: [], low: [] });

      expect(screen.getByText('No risk signals')).toBeInTheDocument();
    });

    it('should not render a link to see details', () => {
      renderRiskSignalsOverview({ high: [], medium: [], low: [] });

      expect(screen.queryByText('See details')).not.toBeInTheDocument();
    });
  });

  describe('when there is at least one risk', () => {
    it('should render a link to see details', () => {
      renderRiskSignalsOverview({
        high: [],
        medium: [],
        low: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Low,
            scopes: [SignalAttribute.phoneNumber],
            reasonCode: 'mobile_number',
            description:
              "The consumer's phone number is possibly a wireless mobile number.",
            deactivatedAt: null,
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            vendors: ['idology'],
            timestamp: '2022-10-24T21:56:12.682238Z',
          },
        ],
      });

      expect(screen.getByText('See details')).toBeInTheDocument();
    });

    it('should open the list of risks when clicking on the "See details" button', async () => {
      renderRiskSignalsOverview({
        high: [],
        medium: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Medium,
            scopes: [SignalAttribute.phoneNumber],
            reasonCode: 'mobile_number',
            description:
              "The consumer's phone number is possibly a wireless mobile number.",
            deactivatedAt: null,
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            vendors: ['idology'],
            timestamp: '2022-10-24T21:56:12.682238Z',
          },
        ],
        low: [
          {
            id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            reasonCode: 'corporate_email_domain',
            description:
              'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
            severity: RiskSignalSeverity.Low,
            scopes: [SignalAttribute.email],
            timestamp: '2022-10-24T21:56:12.682238Z',
            deactivatedAt: null,
            vendors: ['idology'],
          },
        ],
      });

      const seeDetailsButton = screen.getByText('See details');
      await userEvent.click(seeDetailsButton);

      const listDialog = screen.getByRole('dialog');
      expect(listDialog).toBeInTheDocument();

      const firstSignalDescription =
        "The consumer's phone number is possibly a wireless mobile number.";
      expect(screen.getByText(firstSignalDescription)).toBeInTheDocument();

      const secondSignalDescription =
        'Indicates that the domain of the email address has been identified as belonging to a corporate entity.';
      expect(screen.getByText(secondSignalDescription)).toBeInTheDocument();
    });

    describe('when clicking on the risk signal row', () => {
      it('should append risk signal id and note to the url', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/users/detail',
          query: {},
          push: pushMockFn,
        });

        renderRiskSignalsOverview({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [],
        });

        const seeDetailsButton = screen.getByText('See details');
        await userEvent.click(seeDetailsButton);

        const listDialog = screen.getByRole('dialog');
        expect(listDialog).toBeInTheDocument();

        const description =
          "The consumer's phone number is possibly a wireless mobile number.";
        const riskSignalRow = within(listDialog).getByText(description);
        await userEvent.click(riskSignalRow);

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('when it has only low risks', () => {
      it('should render correctly when it has only one low risk', () => {
        renderRiskSignalsOverview({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Low risk signal');
      });

      it('should render correctly when it has two or more low risks', () => {
        renderRiskSignalsOverview({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('2 Low risk signals');
      });
    });

    describe('when it has only medium risks', () => {
      it('should render correctly when it has only one medium risk', () => {
        renderRiskSignalsOverview({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Medium risk signal');
      });

      it('should render correctly when it has two or more medium risks', () => {
        renderRiskSignalsOverview({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('2 Medium risk signals');
      });
    });

    describe('when it has only high risks', () => {
      it('should render correctly when it has only one high risk', () => {
        renderRiskSignalsOverview({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High risk signal');
      });

      it('should render correctly when it has two or more high risks', () => {
        renderRiskSignalsOverview({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
          medium: [],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('2 High risk signals');
      });
    });

    describe('when it only low and medium risks', () => {
      it('should render correctly', () => {
        renderRiskSignalsOverview({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
        });

        const text = screen.getByText('risk signals', { exact: false });
        expect(text.textContent).toEqual('1 Medium and 1 Low risk signals');
      });
    });

    describe('when it only low and high risks', () => {
      it('should render correctly', () => {
        renderRiskSignalsOverview({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High and 1 Low risk signals');
      });
    });

    describe('when it only medium and high risks', () => {
      it('should render correctly', () => {
        renderRiskSignalsOverview({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High and 1 Medium risk signals');
      });
    });

    describe('when it has low, medium and high risks', () => {
      it('should render correctly', () => {
        renderRiskSignalsOverview({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'mobile_number',
              description:
                "The consumer's phone number is possibly a wireless mobile number.",
              deactivatedAt: null,
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              vendors: ['idology'],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
          low: [
            {
              id: 'sig_l124S610Gg1427xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'corporate_email_domain',
              description:
                'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.name],
              timestamp: '2022-10-24T21:56:12.682238Z',
              deactivatedAt: null,
              vendors: ['idology'],
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual(
          '1 High, 1 Medium and 1 Low risk signals',
        );
      });
    });
  });
});
