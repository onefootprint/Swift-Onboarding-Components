import {
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import { RuleOp } from '@onefootprint/types';
import React from 'react';
import { asAdminUserFirmEmployee } from 'src/config/tests';

import type { RulesProps } from './rules';
import Rules from './rules';
import {
  isPrecededByNotBadge,
  kybPlaybookFixture,
  kycPlaybookFixture,
  passRuleFixture,
  rulesFixture,
  selectOption,
  startAdding,
  startEditing,
  stepUpRuleFixture,
  withAddRule,
  withDeleteRule,
  withEditRule,
  withRiskSignals,
  withRules,
  withRulesError,
} from './rules.test.config';

const renderRules = ({
  playbook = kycPlaybookFixture,
}: Partial<RulesProps>) => {
  customRender(<Rules playbook={playbook} />);
};

const renderRulesAndWaitFinishLoading = async () => {
  renderRules({});
  const loading = await screen.findByRole('progressbar', {
    name: 'Loading...',
  });
  await waitForElementToBeRemoved(loading);
};

describe('<Rules />', () => {
  beforeEach(() => {
    asAdminUserFirmEmployee();
  });

  describe('when it is a KYC playbook', () => {
    describe('when the rules request fails', () => {
      it('should show an error message', async () => {
        withRulesError();
        await renderRulesAndWaitFinishLoading();

        const error = screen.getByText('Something went wrong');
        expect(error).toBeInTheDocument();
      });
    });

    describe('when the rules request succeeds', () => {
      beforeEach(() => {
        withRules();
        withRiskSignals();
      });

      it('should show all rules', async () => {
        await renderRulesAndWaitFinishLoading();

        const nots = screen.queryAllByText('not');
        expect(nots).toHaveLength(1);

        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(failSection).queryAllByRole('row');
        expect(failRows).toHaveLength(3);

        // Check alphabetical sorting and that "not" precedes the correct field
        expect(within(failRows[0]).getByText('id_flagged')).toBeInTheDocument();
        expect(
          within(failRows[1]).getByText('id_not_located'),
        ).toBeInTheDocument();
        expect(
          within(failRows[1]).getByText('name_matches'),
        ).toBeInTheDocument();
        expect(
          isPrecededByNotBadge({
            row: failRows[1],
            text: 'name_matches',
          }),
        ).toEqual(true);
        expect(
          within(failRows[1]).getByText('watchlist_hit_ofac'),
        ).toBeInTheDocument();
        expect(
          within(failRows[2]).getByText('subject_deceased'),
        ).toBeInTheDocument();

        const manualRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevRows = within(manualRevSection).queryAllByRole('row');
        expect(manRevRows).toHaveLength(1);
        expect(
          within(manRevRows[0]).getByText('watchlist_hit_ofac'),
        ).toBeInTheDocument();

        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        const stepUpRows = within(stepUpSection).queryAllByRole('row');
        expect(stepUpRows).toHaveLength(1);
        expect(
          within(stepUpRows[0]).getByText(
            'address_alert_single_address_in_file',
          ),
        ).toBeInTheDocument();

        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRows = within(passSection).queryAllByRole('row');
        expect(passRows).toHaveLength(1);
        expect(
          within(passRows[0]).getByText(
            'document_is_permit_or_provisional_license',
          ),
        ).toBeInTheDocument();
      });

      it("should edit 'not' correctly", async () => {
        withEditRule({
          ...rulesFixture[2],
          ruleExpression: [
            {
              field: 'id_not_located',
              op: RuleOp.notEq,
              value: true,
            },
            {
              field: 'adverse_media_hit',
              op: RuleOp.eq,
              value: true,
            },
          ],
        });
        await renderRulesAndWaitFinishLoading();
        const { row } = await startEditing('Fail');

        const notBadge = within(row).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });
      });

      it('should edit the risk signal correctly', async () => {
        withEditRule({
          ...rulesFixture[2],
          ruleExpression: [
            {
              field: 'id_not_located',
              op: RuleOp.notEq,
              value: true,
            },
            {
              field: 'adverse_media_hit',
              op: RuleOp.eq,
              value: true,
            },
          ],
        });
        await renderRulesAndWaitFinishLoading();
        const { row } = await startEditing('Fail');

        const selectTrigger = within(row).getByText('id_flagged');
        await userEvent.click(selectTrigger);

        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('address_alert_longevity');

        await waitFor(() => {
          const selectList = within(row).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });
      });

      it('should cancel editing the not toggle correctly', async () => {
        await renderRulesAndWaitFinishLoading();
        const { section, row } = await startEditing('Fail + Manual review');

        const cancelButton = within(row).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });

        const nots = within(section).queryAllByText('not');
        expect(nots).toHaveLength(0);
      });

      it('should cancel editing the risk signal code correctly', async () => {
        await renderRulesAndWaitFinishLoading();
        const { row } = await startEditing('Fail + Manual review');

        const selectTrigger = within(row).getByText('watchlist_hit_ofac');
        await userEvent.click(selectTrigger);

        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('subject_deceased');
        await waitFor(() => {
          const selectList = within(row).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });

        const cancelButton = within(row).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });
      });

      it('should delete a rule correctly', async () => {
        withDeleteRule(passRuleFixture.ruleId);
        await renderRulesAndWaitFinishLoading();
        const { row } = await startEditing('Pass + Manual review');

        const deleteButton = within(row).getByText('Delete rule');
        await userEvent.click(deleteButton);

        await waitFor(() => {
          const confirmation = screen.getByText(
            'Are you sure you want to delete this rule?',
          );
          expect(confirmation).toBeInTheDocument();
        });

        const deleteConfirmButton = within(row).getByText('Delete');
        await userEvent.click(deleteConfirmButton);
        await waitForElementToBeRemoved(deleteConfirmButton);

        await waitFor(() => {
          const toastTitle = screen.getByText('Success!');
          expect(toastTitle).toBeInTheDocument();
        });
        await waitFor(() => {
          const toastMessage = screen.getByText('Rule deleted.');
          expect(toastMessage).toBeInTheDocument();
        });
      });

      it('should cancel deleting a rule correctly', async () => {
        withDeleteRule(passRuleFixture.ruleId);
        await renderRulesAndWaitFinishLoading();
        const { row } = await startEditing('Pass + Manual review');

        await userEvent.click(within(row).getByText('Delete rule'));

        await waitFor(() => {
          const confirmation = screen.getByText(
            'Are you sure you want to delete this rule?',
          );
          expect(confirmation).toBeInTheDocument();
        });

        const deleteCancelButton = within(row).getByText('Cancel');
        await userEvent.click(deleteCancelButton);

        await waitFor(() => {
          expect(within(row).getByText('Delete rule')).toBeInTheDocument();
        });
      });

      it.skip('should add a rule to an empty section correctly', async () => {
        withAddRule(stepUpRuleFixture);
        await renderRulesAndWaitFinishLoading();
        await startAdding('Step-up');

        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        const addRuleButton = within(stepUpSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(addRuleButton);
        await waitFor(() => {
          expect(addRuleButton).toBeDisabled();
        });

        const rows = within(stepUpSection).queryAllByRole('row');
        expect(rows).toHaveLength(1);

        const newRuleRow = rows[0];
        const notBadge = within(newRuleRow).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });

        const selectTrigger = within(newRuleRow).getByText('Select...');
        await userEvent.click(selectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });

        await selectOption('dob_does_not_match');

        await waitFor(() => {
          expect(
            screen.queryByRole('listbox', {
              name: 'Risk signals',
            }),
          ).not.toBeInTheDocument();
        });

        const saveButton = within(newRuleRow).getByRole('button', {
          name: 'Save',
        });
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(saveButton).not.toBeInTheDocument();
        });

        await waitFor(() => {
          const confirmationTitle = screen.getByText('Success!');
          expect(confirmationTitle).toBeInTheDocument();
        });
        await waitFor(() => {
          const confirmationMessage = screen.getByText('Rule added.');
          expect(confirmationMessage).toBeInTheDocument();
        });
      });

      it('should cancel an added rule correctly', async () => {
        await renderRulesAndWaitFinishLoading();

        const { section } = await startAdding('Pass + Manual review');
        const row = within(section).queryAllByRole('row')[1];

        const notBadge = within(row).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });

        const selectTrigger = within(row).getByText('Select...');
        await userEvent.click(selectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });

        await selectOption('name_matches');
        await waitFor(() => {
          const selectList = within(row).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });

        const cancelButton = within(row).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });

        const nots = within(section).queryAllByText('not');
        expect(nots).toHaveLength(0);
      });
    });
  });

  describe('when it is a KYB playbook', () => {
    it('should show an alert', async () => {
      withRules(kybPlaybookFixture.id);
      await renderRules({ playbook: kybPlaybookFixture });

      await waitFor(() => {
        const alert = screen.getByText(
          "These rules are only applied when verifying a Business Owner's identity.",
        );
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
