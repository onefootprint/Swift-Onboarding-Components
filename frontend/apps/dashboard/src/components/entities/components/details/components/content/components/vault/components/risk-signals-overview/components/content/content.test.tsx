import { createUseRouterSpy, customRender, screen, userEvent, within } from '@onefootprint/test-utils';
import { RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';
import React from 'react';

import type { ContentProps } from './content';
import Content from './content';

const useRouterSpy = createUseRouterSpy();

describe('<Content />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/businesses/fp_bid_VXND11zUVRYQKKUxbUN3KD',
      query: {
        id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
      },
    });
  });

  const renderContent = ({ high, medium, low }: ContentProps) =>
    customRender(<Content high={high} medium={medium} low={low} />);

  describe('when there are no risks', () => {
    it('should render an empty state message', () => {
      renderContent({ high: [], medium: [], low: [] });

      expect(screen.getByText('No risk signals')).toBeInTheDocument();
    });

    it('should not render a link to see details', () => {
      renderContent({ high: [], medium: [], low: [] });

      expect(screen.queryByText('See details')).not.toBeInTheDocument();
    });
  });

  describe('when there is at least one risk', () => {
    it('should render a link to see details', () => {
      renderContent({
        high: [],
        medium: [],
        low: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Low,
            scopes: [RiskSignalAttribute.phoneNumber],
            reasonCode: 'phone_number_located_is_voip',
            note: 'VOIP phone number',
            description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            timestamp: '2022-10-24T21:56:12.682238Z',
            hasAmlHits: false,
          },
        ],
      });

      expect(screen.getByText('See details')).toBeInTheDocument();
    });

    it('should open the list of risks when clicking on the "See details" button', async () => {
      renderContent({
        high: [],
        medium: [
          {
            id: 'sig_ryxauTlDX8hIm3wVRmm',
            severity: RiskSignalSeverity.Medium,
            scopes: [RiskSignalAttribute.phoneNumber],
            reasonCode: 'phone_number_located_is_voip',
            note: 'VOIP phone number',
            description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            timestamp: '2022-10-24T21:56:12.682238Z',
            hasAmlHits: false,
          },
        ],
        low: [
          {
            id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
            onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
            reasonCode: 'email_domain_corporate',
            note: 'Corporate email domain',
            description: 'The domain of the email address has been identified as belonging to a corporate entity.',
            severity: RiskSignalSeverity.Low,
            scopes: [RiskSignalAttribute.email],
            timestamp: '2022-10-24T21:56:12.682238Z',
            hasAmlHits: false,
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
          pathname: '/businesses/fp_bid_VXND11zUVRYQKKUxbUN3KD',
          query: {
            id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
          },
          push: pushMockFn,
        });

        renderContent({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
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
              id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
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
        renderContent({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Low risk signal');
      });

      it('should render correctly when it has two or more low risks', () => {
        renderContent({
          high: [],
          medium: [],
          low: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('2 Low risk signals');
      });
    });

    describe('when it has only medium risks', () => {
      it('should render correctly when it has only one medium risk', () => {
        renderContent({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 Medium risk signal');
      });

      it('should render correctly when it has two or more medium risks', () => {
        renderContent({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
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
        renderContent({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          medium: [],
          low: [],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High risk signal');
      });

      it('should render correctly when it has two or more high risks', () => {
        renderContent({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
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
        renderContent({
          high: [],
          medium: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
        });

        const text = screen.getByText('risk signals', { exact: false });
        expect(text.textContent).toEqual('1 Medium and 1 Low risk signals');
      });
    });

    describe('when it only low and high risks', () => {
      it('should render correctly', () => {
        renderContent({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          medium: [],
          low: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High and 1 Low risk signals');
      });
    });

    describe('when it only medium and high risks', () => {
      it('should render correctly', () => {
        renderContent({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
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
        renderContent({
          high: [
            {
              id: 'sig_ryxauTlDX8hIm3wVRmm',
              severity: RiskSignalSeverity.High,
              scopes: [RiskSignalAttribute.phoneNumber],
              reasonCode: 'phone_number_located_is_voip',
              note: 'VOIP phone number',
              description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          medium: [
            {
              id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Medium,
              scopes: [RiskSignalAttribute.email],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
          low: [
            {
              id: 'sig_l124S610Gg1427xUOkBSUL8NcC',
              onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
              reasonCode: 'email_domain_corporate',
              note: 'Corporate email domain',
              description: 'The domain of the email address has been identified as belonging to a corporate entity.',
              severity: RiskSignalSeverity.Low,
              scopes: [RiskSignalAttribute.name],
              timestamp: '2022-10-24T21:56:12.682238Z',
              hasAmlHits: false,
            },
          ],
        });

        const text = screen.getByText('risk signal', { exact: false });
        expect(text.textContent).toEqual('1 High, 1 Medium and 1 Low risk signals');
      });
    });
  });
});
