import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';
import React from 'react';

import Data, { DataProps } from './data';

const useRouterSpy = createUseRouterSpy();

describe('<Data />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/users/detail', query: {} });
  });

  const renderData = ({ high, medium, low }: DataProps) =>
    customRender(<Data high={high} medium={medium} low={low} />);

  describe('when there are no risks', () => {
    it('should render an empty state message', () => {
      renderData({ high: [], medium: [], low: [] });

      expect(screen.getByText('No risk signals')).toBeInTheDocument();
    });

    it('should not render a link to see details', () => {
      renderData({ high: [], medium: [], low: [] });

      expect(screen.queryByText('See details')).not.toBeInTheDocument();
    });
  });

  describe('when there is at least one risk', () => {
    it('should render a link to see details', () => {
      renderData({
        high: [],
        medium: [],
        low: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Low,
            scopes: [SignalAttribute.phoneNumber],
            reasonCode: 'phone_number_located_is_voip',
            note: 'VOIP phone number',
            description:
              "The consumer's phone number could be tied to an answering service, page, or VoIP.",
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            timestamp: '2022-10-24T21:56:12.682238Z',
          },
        ],
      });

      expect(screen.getByText('See details')).toBeInTheDocument();
    });

    it('should open the list of risks when clicking on the "See details" button', async () => {
      renderData({
        high: [],
        medium: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Medium,
            scopes: [SignalAttribute.phoneNumber],
            reasonCode: 'phone_number_located_is_voip',
            note: 'VOIP phone number',
            description:
              "The consumer's phone number could be tied to an answering service, page, or VoIP.",
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            timestamp: '2022-10-24T21:56:12.682238Z',
          },
        ],
        low: [
          {
            id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            reasonCode: 'email_domain_corporate',
            note: 'Corporate email domain',
            description:
              'The domain of the email address has been identified as belonging to a corporate entity.',
            severity: RiskSignalSeverity.Low,
            scopes: [SignalAttribute.email],
            timestamp: '2022-10-24T21:56:12.682238Z',
          },
        ],
      });

      const seeDetailsButton = screen.getByText('See details');
      await userEvent.click(seeDetailsButton);

      const listDialog = screen.getByRole('dialog');
      expect(listDialog).toBeInTheDocument();

      const firstNote = 'VOIP phone number';
      expect(screen.getByText(firstNote)).toBeInTheDocument();

      const secondNote = 'Corporate email domain';
      expect(screen.getByText(secondNote)).toBeInTheDocument();
    });

    describe('when clicking on the risk signal row', () => {
      it('should append risk signal id to the url', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/users/detail',
          query: {},
          push: pushMockFn,
        });

        renderData({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [],
        });

        const seeDetailsButton = screen.getByText('See details');
        await userEvent.click(seeDetailsButton);

        const listDialog = screen.getByRole('dialog');
        expect(listDialog).toBeInTheDocument();

        const note = 'VOIP phone number';
        const riskSignalRow = within(listDialog).getByText(note);
        await userEvent.click(riskSignalRow);

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              risk_signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('when it has only low risks', () => {
      it('should render correctly when it has only one low risk', () => {
        renderData({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Low risk signal');
      });

      it('should render correctly when it has two or more low risks', () => {
        renderData({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('2 Low risk signals');
      });
    });

    describe('when it has only medium risks', () => {
      it('should render correctly when it has only one medium risk', () => {
        renderData({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Medium risk signal');
      });

      it('should render correctly when it has two or more medium risks', () => {
        renderData({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
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
        renderData({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
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
        renderData({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
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
        renderData({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
        });

        const text = screen.getByText('risk signals', { exact: false });
        expect(text.textContent).toEqual('1 Medium and 1 Low risk signals');
      });
    });

    describe('when it only low and high risks', () => {
      it('should render correctly', () => {
        renderData({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High and 1 Low risk signals');
      });
    });

    describe('when it only medium and high risks', () => {
      it('should render correctly', () => {
        renderData({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
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
        renderData({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [SignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description:
                "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [SignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
            },
          ],
          low: [
            {
              id: 'sig_l124S610Gg1427xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description:
                'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [SignalAttribute.name],
              timestamp: '2022-10-24T21:56:12.682238Z',
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
