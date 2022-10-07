import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
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
            id: '1',
            severity: 'low',
            scope: 'identity',
            note: 'SSN tied to multiple names',
            noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
            id: '1',
            severity: 'medium',
            scope: 'identity',
            note: 'SSN tied to multiple names',
            noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
          },
        ],
        low: [
          {
            id: '2',
            severity: 'low',
            scope: 'identity',
            note: 'SSN Issued Prior to DOB',
            noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
          },
        ],
      });

      const seeDetailsButton = screen.getByText('See details');
      await userEvent.click(seeDetailsButton);

      const listDialog = screen.getByRole('dialog');
      expect(listDialog).toBeInTheDocument();

      expect(
        screen.getByText('SSN tied to multiple names'),
      ).toBeInTheDocument();
      expect(screen.getByText('SSN Issued Prior to DOB')).toBeInTheDocument();
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
              id: '1',
              severity: 'medium',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          low: [],
        });

        const seeDetailsButton = screen.getByText('See details');
        await userEvent.click(seeDetailsButton);

        const listDialog = screen.getByRole('dialog');
        expect(listDialog).toBeInTheDocument();

        const riskSignalRow = within(listDialog).getByText(
          'SSN tied to multiple names',
        );
        await userEvent.click(riskSignalRow);

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              signal_id: '1',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
            {
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
            {
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
            {
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          low: [
            {
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          medium: [],
          low: [
            {
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          medium: [
            {
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Lorem tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          medium: [
            {
              id: '1',
              severity: 'low',
              scope: 'identity',
              note: 'SSN tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
            },
          ],
          low: [
            {
              id: '2',
              severity: 'low',
              scope: 'identity',
              note: 'Magna tied to multiple names',
              noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
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
