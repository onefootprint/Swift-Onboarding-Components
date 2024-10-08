import { customRender, screen, userEvent, waitFor, waitForElementToBeRemoved, within } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import type { BacktestingDialogProps } from './backtesting-dialog';
import BacktestingDialog from './backtesting-dialog';
import {
  emptyBacktestedRulesFixture,
  kycPlaybookFixture,
  noneAffectedBacktestedRulesFixture,
  withEvaluateRules,
  withEvaluateRulesError,
} from './backtesting-dialog.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<BacktestingDialog />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/playbooks/${kycPlaybookFixture.id}`);
    mockRouter.query = {
      id: kycPlaybookFixture.id,
    };
  });

  const defaultOptions = {
    open: true,
    playbookId: kycPlaybookFixture.id,
    ruleEdits: {},
    isSaveLoading: false,
    onSave: jest.fn(),
    onClose: jest.fn(),
  };

  const renderBacktestingDialog = ({
    open = defaultOptions.open,
    playbookId = defaultOptions.playbookId,
    ruleEdits = defaultOptions.ruleEdits,
    isSaveLoading = defaultOptions.isSaveLoading,
    onSave = defaultOptions.onSave,
    onClose = defaultOptions.onClose,
  }: Partial<BacktestingDialogProps>) =>
    customRender(
      <BacktestingDialog
        open={open}
        playbookId={playbookId}
        ruleEdits={ruleEdits}
        isSaveLoading={isSaveLoading}
        onSave={onSave}
        onClose={onClose}
      />,
    );

  const renderDialogAndWaitFinishLoading = async () => {
    renderBacktestingDialog({});
    const loading = await screen.findByRole('progressbar', {
      name: 'Loading...',
    });
    await waitForElementToBeRemoved(loading);
  };

  describe('when the evaluate rules request succeeds', () => {
    describe('when the backtesting data is varied', () => {
      beforeEach(() => {
        withEvaluateRules();
      });

      it('should show a table of results that paginates correctly', async () => {
        await renderDialogAndWaitFinishLoading();

        expect(screen.getByText('11 out of 14 total onboardings matched')).toBeInTheDocument();
        expect(
          screen.getByText("If these rules existed in the selected period they would've affected 11 onboardings."),
        ).toBeInTheDocument();

        Array.from({ length: 9 }, (_, i) => i + 1).forEach(num =>
          expect(screen.getByText(`fp_${num}`)).toBeInTheDocument(),
        );
        expect(screen.getByText('fp_12')).toBeInTheDocument();
        // fp_0, fp_10, fp_11 aren't shown because their outcomes didn't change
        expect(screen.queryByText('fp_0')).not.toBeInTheDocument();
        expect(screen.queryByText('fp_10')).not.toBeInTheDocument();
        expect(screen.queryByText('fp_11')).not.toBeInTheDocument();
        // fp_13 isn't shown because of pagination
        expect(screen.queryByText('fp_13')).not.toBeInTheDocument();

        const paginationText = screen.getByText('Showing 1 to 10 of 11 total results');
        const prevPaginationButton = screen.getByRole('button', {
          name: 'Previous',
        });
        const nextPaginationButton = screen.getByRole('button', {
          name: 'Next',
        });
        expect(paginationText).toBeInTheDocument();
        expect(prevPaginationButton).toBeDisabled();

        await userEvent.click(nextPaginationButton);
        await waitFor(() => {
          expect(prevPaginationButton).not.toBeDisabled();
        });
        expect(screen.queryByText('fp_1')).not.toBeInTheDocument();
        expect(screen.getByText('fp_13')).toBeInTheDocument();
      });

      it('should show a section detailing original rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const originalSection = screen.getByRole('group', {
          name: 'Original rule outcomes',
        });
        expect(within(originalSection).getByText('Original rule outcomes')).toBeInTheDocument();
        expect(
          within(originalSection).getByText(
            'Rule outcomes based on existing rules at the time of the onboardings above.',
          ),
        ).toBeInTheDocument();

        const outcomeRows = within(originalSection).getAllByRole('row');
        const ruleOutcomes = {
          Fail: '1 (7%)',
          'Step-up': '0 (0%)',
          'Fail + Manual review': '0 (0%)',
          'Pass + Manual review': '0 (0%)',
          Pass: '13 (93%)',
        };
        Object.entries(ruleOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(outcomeRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(outcomeRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });

      it('should show a section detailing backtested rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const backtestedSection = screen.getByRole('group', {
          name: 'Backtested rule outcomes',
        });
        expect(within(backtestedSection).getByText('Backtested rule outcomes')).toBeInTheDocument();
        expect(
          within(backtestedSection).getByText(
            "If the rules that are being tested existed at the time of the onboardings above, the rule outcomes would've been these instead:",
          ),
        ).toBeInTheDocument();

        const outcomeRows = within(backtestedSection).getAllByRole('row');
        const ruleOutcomes = {
          Fail: '4 (29%)',
          'Step-up': '5 (36%)',
          'Fail + Manual review': '2 (14%)',
          'Pass + Manual review': '1 (7%)',
          Pass: '2 (14%)',
        };
        Object.entries(ruleOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(outcomeRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(outcomeRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });

      it('should show a section detailing the correlation between original and backtested rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const correlationSection = screen.getByRole('group', {
          name: 'Original rule outcomes to Backtested rule outcomes',
        });
        expect(
          within(correlationSection).getByText('Original rule outcomes to Backtested rule outcomes'),
        ).toBeInTheDocument();
        expect(
          within(correlationSection).getByText('Correlation between original and backtested rule outcomes.'),
        ).toBeInTheDocument();

        const passSection = within(correlationSection).getByRole('group', {
          name: 'pass correlation card',
        });
        const passSectionRows = within(passSection).getAllByRole('row');
        const originallyPassedOutcomes = {
          Pass: '2',
          Fail: '3',
          'Step-up': '5',
          'Fail + Manual review': '2',
          'Pass + Manual review': '1',
        };
        Object.entries(originallyPassedOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(passSectionRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(passSectionRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });

        const failSection = within(correlationSection).getByRole('group', {
          name: 'fail correlation card',
        });
        const failSectionRows = within(failSection).getAllByRole('row');
        const originallyFailedOutcomes = {
          Fail: '1',
          'Step-up': '0',
          'Fail + Manual review': '0',
          'Pass + Manual review': '0',
          Pass: '0',
        };
        Object.entries(originallyFailedOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(failSectionRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(failSectionRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });
    });

    describe('when the backtesting data has no affected onboardings', () => {
      beforeEach(() => {
        withEvaluateRules(noneAffectedBacktestedRulesFixture);
      });

      it('should show a no onboardings affected message', async () => {
        await renderDialogAndWaitFinishLoading();

        expect(screen.getByText("No onboardings would've been affected.")).toBeInTheDocument();
        const prevPaginationButton = screen.queryByRole('button', {
          name: 'Previous',
        });
        expect(prevPaginationButton).not.toBeInTheDocument();
        const nextPaginationButton = screen.queryByRole('button', {
          name: 'Next',
        });
        expect(nextPaginationButton).not.toBeInTheDocument();
      });

      it('should show a section detailing original rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const originalSection = screen.getByRole('group', {
          name: 'Original rule outcomes',
        });
        const outcomeRows = within(originalSection).getAllByRole('row');
        const ruleOutcomes = {
          Fail: '1 (33%)',
          'Step-up': '0 (0%)',
          'Fail + Manual review': '0 (0%)',
          'Pass + Manual review': '0 (0%)',
          Pass: '2 (67%)',
        };
        Object.entries(ruleOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(outcomeRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(outcomeRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });

      it('should show a section detailing backtested rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const backtestedSection = screen.getByRole('group', {
          name: 'Backtested rule outcomes',
        });
        const outcomeRows = within(backtestedSection).getAllByRole('row');
        const ruleOutcomes = {
          Fail: '1 (33%)',
          'Step-up': '0 (0%)',
          'Fail + Manual review': '0 (0%)',
          'Pass + Manual review': '0 (0%)',
          Pass: '2 (67%)',
        };
        Object.entries(ruleOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(outcomeRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(outcomeRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });

      it('should show a section detailing the correlation between original and backtested rule outcomes', async () => {
        await renderDialogAndWaitFinishLoading();

        const correlationSection = screen.getByRole('group', {
          name: 'Original rule outcomes to Backtested rule outcomes',
        });
        const passSection = within(correlationSection).getByRole('group', {
          name: 'pass correlation card',
        });
        const passSectionRows = within(passSection).getAllByRole('row');
        const originallyPassedOutcomes = {
          Pass: '2',
          Fail: '0',
          'Step-up': '0',
          'Fail + Manual review': '0',
          'Pass + Manual review': '0',
        };
        Object.entries(originallyPassedOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(passSectionRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(passSectionRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });

        const failSection = within(correlationSection).getByRole('group', {
          name: 'fail correlation card',
        });
        const failSectionRows = within(failSection).getAllByRole('row');
        const originallyFailedOutcomes = {
          Fail: '1',
          'Step-up': '0',
          'Fail + Manual review': '0',
          'Pass + Manual review': '0',
          Pass: '0',
        };
        Object.entries(originallyFailedOutcomes).forEach(([outcomeName, outcomeCount], index) => {
          expect(within(failSectionRows[index]).getByText(outcomeName)).toBeInTheDocument();
          expect(within(failSectionRows[index]).getByText(outcomeCount)).toBeInTheDocument();
        });
      });
    });

    describe('when the backtesting data is empty', () => {
      it('should show a no onboardings message', async () => {
        withEvaluateRules(emptyBacktestedRulesFixture);
        await renderDialogAndWaitFinishLoading();

        expect(
          screen.getByText(
            'This playbook did not have any onboardings during this time period. Please try a different date range.',
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when the evaluate rules request fails', () => {
    it('should show an error message', async () => {
      withEvaluateRulesError();
      await renderDialogAndWaitFinishLoading();

      const error = screen.getByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });
});
