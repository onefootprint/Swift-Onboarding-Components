import {
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import { RiskSignalRuleOp } from '@onefootprint/types';
import React from 'react';
import { asAdminUserFirmEmployee } from 'src/config/tests';

import type { RulesProps } from './rules';
import Rules from './rules';
import {
  isNotTriggered,
  kybPlaybookFixture,
  kycPlaybookFixture,
  manualReviewRuleFixture,
  rulesFixture,
  selectOption,
  startEditing,
  stepUpRuleFixture,
  withEditRules,
  withLists,
  withRiskSignals,
  withRules,
  withRulesError,
} from './rules.test.config';

const renderRules = ({
  playbook = kycPlaybookFixture,
}: Partial<RulesProps>) => {
  customRender(<Rules playbook={playbook} toggleDisableHeading={jest.fn()} />);
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
        withLists();
      });

      it('should show all rules', async () => {
        await renderRulesAndWaitFinishLoading();

        const nots = screen.getAllByText('is not');
        expect(nots).toHaveLength(1);

        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(failSection).getAllByRole('row');
        expect(failRows).toHaveLength(4);

        // Check alphabetical sorting and that "not" precedes the correct field
        expect(within(failRows[0]).getByText('id_flagged')).toBeInTheDocument();
        expect(
          within(failRows[1]).getByText('id_not_located'),
        ).toBeInTheDocument();
        expect(
          within(failRows[1]).getByText('name_matches'),
        ).toBeInTheDocument();
        expect(
          isNotTriggered({
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
        expect(within(failRows[3]).getByText('id.email')).toBeInTheDocument();
        expect(within(failRows[3]).getByText('1')).toBeInTheDocument();

        const manualRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevRows = within(manualRevSection).getAllByRole('row');
        expect(manRevRows).toHaveLength(1);
        expect(
          within(manRevRows[0]).getByText('watchlist_hit_ofac'),
        ).toBeInTheDocument();

        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRows = within(passSection).getAllByRole('row');
        expect(passRows).toHaveLength(1);
        expect(
          within(passRows[0]).getByText(
            'document_is_permit_or_provisional_license',
          ),
        ).toBeInTheDocument();
      });

      it('should change the display correctly once editing', async () => {
        await renderRulesAndWaitFinishLoading();

        expect(
          screen.getByRole('button', {
            name: 'Edit',
          }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('button', {
            name: 'Add rule',
          }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', {
            name: 'and',
          }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', {
            name: 'delete',
          }),
        ).not.toBeInTheDocument();

        await startEditing();
        expect(
          screen.getAllByRole('button', {
            name: 'Add rule',
          }).length,
        ).toEqual(6);
        expect(
          screen.getAllByRole('button', {
            name: 'Add risk signal condition',
          }).length,
        ).toEqual(6);
        expect(
          screen.getAllByRole('button', {
            name: 'Add list condition',
          }).length,
        ).toEqual(6);
        expect(
          screen.getAllByRole('button', {
            name: 'delete',
          }).length,
        ).toEqual(6);
        expect(
          screen.getByRole('button', {
            name: 'Save changes',
          }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', {
            name: 'Cancel',
          }),
        ).toBeInTheDocument();
      });

      it('should edit existing rules correctly', async () => {
        withEditRules([
          {
            ...rulesFixture[2],
            ruleExpression: [
              {
                field: 'address_alert_longevity',
                op: RiskSignalRuleOp.notEq,
                value: true,
              },
            ],
          },
          {
            ...rulesFixture[4],
            ruleExpression: [
              {
                field: 'document_is_permit_or_provisional_license',
                op: RiskSignalRuleOp.eq,
                value: true,
              },
              {
                field: 'name_matches',
                op: RiskSignalRuleOp.eq,
                value: true,
              },
            ],
          },
        ]);
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Edit Fail 'id_flagged' rule's op and field
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const [failRow] = within(failSection).getAllByRole('row');

        const opSelectTrigger = within(failRow).getByText('is');
        await userEvent.click(opSelectTrigger);
        await waitFor(() => {
          expect(
            screen.getByRole('option', {
              name: 'is',
            }),
          ).toBeInTheDocument();
        });
        await selectOption('is not');
        await waitFor(() => {
          expect(
            within(failRow).getByText('Pending change'),
          ).toBeInTheDocument();
        });

        const failSelectTrigger = within(failRow).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('address_alert_longevity');
        await waitFor(() => {
          const selectList = within(failRow).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });

        // Edit Pass 'document_is_permit_or_provisional_license' rule by adding an is not field
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');

        const addFieldButton = within(passRow).getByRole('button', {
          name: 'Add risk signal condition',
        });
        await userEvent.click(addFieldButton);
        await waitFor(() => {
          expect(addFieldButton).toBeDisabled();
        });
        await waitFor(() => {
          expect(
            within(failRow).getByText('Pending change'),
          ).toBeInTheDocument();
        });

        const newOpTrigger = within(passRow).getAllByText('is')[1];
        await userEvent.click(newOpTrigger);
        await waitFor(() => {
          expect(
            screen.getByRole('option', {
              name: 'is',
            }),
          ).toBeInTheDocument();
        });
        await selectOption('is not');

        const passSelectTrigger = within(passRow).getByText('risk signal');
        await userEvent.click(passSelectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('name_matches');
        await waitFor(() => {
          expect(
            screen.queryByRole('listbox', {
              name: 'Risk signals',
            }),
          ).not.toBeInTheDocument();
        });

        // Save edits
        const saveButton = screen.getByRole('button', {
          name: 'Save changes',
        });
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(
            screen.queryByRole('button', {
              name: 'Save changes',
            }),
          ).not.toBeInTheDocument();
        });

        // New rules are displayed
        const editedFailSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(editedFailSection).getAllByRole('row');
        await waitFor(() => {
          expect(failRows).toHaveLength(4);
        });
        await waitFor(() => {
          expect(
            within(failRows[0]).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            isNotTriggered({
              row: failRows[0],
              text: 'address_alert_longevity',
            }),
          ).toEqual(true);
        });

        const editedPassSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const newPassRow = within(editedPassSection).getByRole('row');
        await waitFor(() => {
          expect(
            within(newPassRow).getByText(
              'document_is_permit_or_provisional_license',
            ),
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            within(newPassRow).getByText('name_matches'),
          ).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            isNotTriggered({
              row: newPassRow,
              text: 'name_matches',
            }),
          ).toEqual(true);
        });

        await waitFor(() => {
          expect(screen.queryAllByText('Pending change').length).toEqual(0);
        });
      });

      it('should delete and add multiple rules correctly', async () => {
        withEditRules([
          ...rulesFixture.slice(1, 4),
          stepUpRuleFixture,
          {
            ...manualReviewRuleFixture,
            ruleId: 'newId',
            ruleExpression: [
              { field: 'id_flagged', op: RiskSignalRuleOp.eq, value: true },
            ],
          },
        ]);
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Delete Fail 'id_flagged' rule
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const [failRow] = within(failSection).getAllByRole('row');
        await userEvent.click(
          within(failRow).getByRole('button', {
            name: 'delete',
          }),
        );
        await waitFor(() => {
          expect(
            within(failRow).getByText('Pending deletion'),
          ).toBeInTheDocument();
        });

        // Delete Pass 'document_is_permit_or_provisional_license' rule
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');
        await userEvent.click(
          within(passRow).getByRole('button', {
            name: 'delete',
          }),
        );
        await waitFor(() => {
          expect(
            within(passRow).getByText('Pending deletion'),
          ).toBeInTheDocument();
        });

        // Add 'dob_does_not_match' rule to empty Step-up section
        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        await userEvent.click(
          within(stepUpSection).getByRole('button', {
            name: 'Add rule',
          }),
        );
        await waitFor(() => {
          expect(
            within(stepUpSection).queryByText('No rule has been configured.'),
          ).not.toBeInTheDocument();
        });

        const stepUpRow = within(stepUpSection).getByRole('row');
        const stepUpFieldButton = within(stepUpRow).getByRole('button', {
          name: 'Add risk signal condition',
        });
        await userEvent.click(stepUpFieldButton);
        await waitFor(() => {
          expect(stepUpFieldButton).toBeDisabled();
        });
        const stepUpTrigger = within(stepUpRow).getByText('risk signal');
        await userEvent.click(stepUpTrigger);
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

        // Add 'id_flagged' rule to Manual review
        const manRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        await userEvent.click(
          within(manRevSection).getByRole('button', {
            name: 'Add rule',
          }),
        );
        await waitFor(() => {
          expect(within(manRevSection).getAllByRole('row').length).toEqual(2);
        });

        const manRevRow = within(manRevSection).getAllByRole('row')[1];
        const manRevFieldButton = within(manRevRow).getByRole('button', {
          name: 'Add risk signal condition',
        });
        await userEvent.click(manRevFieldButton);
        await waitFor(() => {
          expect(manRevFieldButton).toBeDisabled();
        });
        const manRevTrigger = within(manRevRow).getByText('risk signal');
        await userEvent.click(manRevTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('id_flagged');
        await waitFor(() => {
          expect(
            screen.queryByRole('listbox', {
              name: 'Risk signals',
            }),
          ).not.toBeInTheDocument();
        });

        // Save edits
        const saveButton = screen.getByRole('button', {
          name: 'Save changes',
        });
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(
            screen.queryByRole('button', {
              name: 'Save changes',
            }),
          ).not.toBeInTheDocument();
        });

        // New rules are displayed
        const editedStepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        expect(
          within(within(editedStepUpSection).getByRole('row')).getByText(
            'dob_does_not_match',
          ),
        ).toBeInTheDocument();

        const editedManRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevRows = within(editedManRevSection).getAllByRole('row');
        expect(manRevRows.length).toEqual(2);
        expect(
          within(manRevRows[1]).getByText('id_flagged'),
        ).toBeInTheDocument();
      });

      it('should undo edits and deletions and delete added rule rows correctly', async () => {
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Edit Fail 'id_flagged' rule's not toggle and field, then undo
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(failSection).getAllByRole('row');

        const opSelectTrigger = within(failRows[0]).getByText('is');
        await userEvent.click(opSelectTrigger);
        await waitFor(() => {
          expect(
            screen.getByRole('option', {
              name: 'is',
            }),
          ).toBeInTheDocument();
        });
        await selectOption('is not');
        await waitFor(() => {
          expect(
            within(failRows[0]).getByText('Pending change'),
          ).toBeInTheDocument();
        });

        const failSelectTrigger = within(failRows[0]).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('address_alert_longevity');
        await waitFor(() => {
          const selectList = within(failRows[0]).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });

        const undoButton1 = within(failRows[0]).getByRole('button', {
          name: 'undo',
        });
        await userEvent.click(undoButton1);
        await waitFor(() => {
          expect(undoButton1).not.toBeInTheDocument();
        });

        // Save should be disabled since there are no edits
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Save changes' }),
          ).toBeDisabled();
        });

        // Delete Fail 'subject_deceased' rule, then undo
        await userEvent.click(
          within(failRows[2]).getByRole('button', {
            name: 'delete',
          }),
        );
        await waitFor(() => {
          expect(
            within(failRows[2]).getByText('Pending deletion'),
          ).toBeInTheDocument();
        });

        const undoButton2 = within(failRows[2]).getByRole('button', {
          name: 'undo',
        });
        await userEvent.click(undoButton2);
        await waitFor(() => {
          expect(undoButton2).not.toBeInTheDocument();
        });

        // Save should be disabled since there are no edits
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Save changes' }),
          ).toBeDisabled();
        });

        // Add rule to Manual review, then delete it before saving
        const manRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        await userEvent.click(
          within(manRevSection).getByRole('button', {
            name: 'Add rule',
          }),
        );
        await waitFor(() => {
          expect(within(manRevSection).getAllByRole('row').length).toEqual(2);
        });
        await userEvent.click(
          within(within(manRevSection).getAllByRole('row')[1]).getByRole(
            'button',
            {
              name: 'delete',
            },
          ),
        );
        await waitFor(() => {
          expect(within(manRevSection).getAllByRole('row').length).toEqual(1);
        });

        // Save should be disabled since there are no edits
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Save changes' }),
          ).toBeDisabled();
        });
      });

      it('should cancel edits, adds, and deletes correctly', async () => {
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Edit Fail 'id_flagged' rule's op and field
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(failSection).getAllByRole('row');

        const opSelectTrigger = within(failRows[0]).getByText('is');
        await userEvent.click(opSelectTrigger);
        await waitFor(() => {
          expect(
            screen.getByRole('option', {
              name: 'is',
            }),
          ).toBeInTheDocument();
        });
        await selectOption('is not');
        await waitFor(() => {
          expect(
            within(failRows[0]).getByText('Pending change'),
          ).toBeInTheDocument();
        });

        const failSelectTrigger = within(failRows[0]).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        await screen.findByRole('listbox', {
          name: 'Risk signals',
        });
        await selectOption('address_alert_longevity');
        await waitFor(() => {
          const selectList = within(failRows[0]).queryByRole('listbox', {
            name: 'Risk signals',
          });
          expect(selectList).not.toBeInTheDocument();
        });

        // Delete Fail 'subject_deceased' rule
        await userEvent.click(
          within(failRows[2]).getByRole('button', {
            name: 'delete',
          }),
        );
        await waitFor(() => {
          expect(
            within(failRows[2]).getByText('Pending deletion'),
          ).toBeInTheDocument();
        });

        // Delete Pass 'document_is_permit_or_provisional_license' rule
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');
        await userEvent.click(
          within(passRow).getByRole('button', {
            name: 'delete',
          }),
        );
        await waitFor(() => {
          expect(
            within(passRow).getByText('Pending deletion'),
          ).toBeInTheDocument();
        });

        // Add 'dob_does_not_match' rule to empty Step-up section
        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        await userEvent.click(
          within(stepUpSection).getByRole('button', {
            name: 'Add rule',
          }),
        );
        await waitFor(() => {
          expect(
            within(stepUpSection).queryByText('No rule has been configured.'),
          ).not.toBeInTheDocument();
        });

        const stepUpRow = within(stepUpSection).getByRole('row');
        const addFieldButton = within(stepUpRow).getByRole('button', {
          name: 'Add risk signal condition',
        });
        await userEvent.click(addFieldButton);
        await waitFor(() => {
          expect(addFieldButton).toBeDisabled();
        });
        const stepUpTrigger = within(stepUpRow).getByText('risk signal');
        await userEvent.click(stepUpTrigger);
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

        // Cancel changes
        const cancelButton = screen.getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(
            screen.queryByRole('button', {
              name: 'Cancel',
            }),
          ).not.toBeInTheDocument();
        });

        // No changes are made
        expect(screen.queryAllByText('Pending change').length).toEqual(0);
        expect(screen.queryAllByText('Pending deletion').length).toEqual(0);

        expect(within(failSection).getAllByRole('row')).toHaveLength(4);
        expect(within(failRows[0]).getByText('id_flagged')).toBeInTheDocument();
        expect(
          within(failRows[2]).getByText('subject_deceased'),
        ).toBeInTheDocument();

        const passRows = within(passSection).getAllByRole('row');
        expect(passRows).toHaveLength(1);

        expect(
          within(stepUpSection).getByText('No rule has been configured.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when it is a KYB playbook', () => {
    it('should show an alert', async () => {
      withRules(kybPlaybookFixture.id);
      withLists();
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
