import {
  customRender,
  mockRouter,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import { RiskSignalRuleOp } from '@onefootprint/types';
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
  withEvaluateRules,
  withLists,
  withRiskSignals,
  withRules,
  withRulesError,
} from './rules.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderRules = ({ playbook = kycPlaybookFixture }: Partial<RulesProps>) => {
  customRender(<Rules playbook={playbook} toggleDisableHeading={jest.fn()} />);
};

const renderRulesAndWaitFinishLoading = async () => {
  renderRules({});
  await waitForElementToBeRemoved(() => screen.queryAllByRole('progressbar'));
};

describe('<Rules />', () => {
  beforeEach(() => {
    asAdminUserFirmEmployee();
  });

  describe('when it is a KYC playbook', () => {
    mockRouter.setCurrentUrl(`/playbooks/${kycPlaybookFixture.id}`);
    mockRouter.query = {
      id: kycPlaybookFixture.id,
    };

    describe('when the rules request fails', () => {
      it('should show an error message', async () => {
        withRulesError();
        await renderRulesAndWaitFinishLoading();

        const error = screen.getByText('Flerp error');
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
        expect(within(failRows[1]).getByText('id_not_located')).toBeInTheDocument();
        expect(within(failRows[1]).getByText('name_matches')).toBeInTheDocument();
        expect(
          isNotTriggered({
            row: failRows[1],
            text: 'name_matches',
          }),
        ).toEqual(true);
        expect(within(failRows[1]).getByText('watchlist_hit_ofac')).toBeInTheDocument();
        expect(within(failRows[2]).getByText('subject_deceased')).toBeInTheDocument();
        expect(within(failRows[3]).getByText('id.email')).toBeInTheDocument();
        expect(within(failRows[3]).getByText('1')).toBeInTheDocument();

        const manualRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevRows = within(manualRevSection).getAllByRole('row');
        expect(manRevRows).toHaveLength(1);
        expect(within(manRevRows[0]).getByText('watchlist_hit_ofac')).toBeInTheDocument();

        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRows = within(passSection).getAllByRole('row');
        expect(passRows).toHaveLength(1);
        expect(within(passRows[0]).getByText('document_is_permit_or_provisional_license')).toBeInTheDocument();
      });

      it('should change the display correctly once editing', async () => {
        await renderRulesAndWaitFinishLoading();

        const editButton = screen.getByRole('button', {
          name: 'Edit',
        });
        expect(editButton).toBeInTheDocument();

        const addButton = screen.queryByRole('button', {
          name: 'Add rule',
        });
        expect(addButton).not.toBeInTheDocument();

        const deleteButton = screen.queryByRole('button', {
          name: 'delete',
        });
        expect(deleteButton).not.toBeInTheDocument();

        await startEditing();
        const addButtons = screen.getAllByRole('button', {
          name: 'Add rule',
        });
        expect(addButtons.length).toEqual(6);

        const addRiskSignalConditionButtons = screen.getAllByRole('button', {
          name: 'Add risk signal condition',
        });
        expect(addRiskSignalConditionButtons.length).toEqual(6);

        const addListConditionButtons = screen.getAllByRole('button', {
          name: 'Add list condition',
        });
        expect(addListConditionButtons.length).toEqual(6);

        const deleteButtons = screen.getAllByRole('button', {
          name: 'delete',
        });
        expect(deleteButtons.length).toEqual(6);

        const submitButton = screen.getByRole('button', {
          name: 'Test changes',
        });
        expect(submitButton).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', {
          name: 'Cancel',
        });
        expect(cancelButton).toBeInTheDocument();
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
        withEvaluateRules();
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Edit Fail 'id_flagged' rule's op and field
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const [failRow] = within(failSection).getAllByRole('row');

        const opSelectTrigger = within(failRow).getByText('is');
        await userEvent.click(opSelectTrigger);
        const failIsOption = await screen.findByRole('option', {
          name: 'is',
        });
        expect(failIsOption).toBeInTheDocument();
        await selectOption('is not');
        expect(within(failRow).getByText('Pending change')).toBeInTheDocument();

        const failSelectTrigger = within(failRow).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        await waitFor(() => {
          const combobox = screen.getByRole('listbox', {
            name: 'Risk signal options',
          });
          expect(combobox).toBeInTheDocument();
        });

        await selectOption('address_alert_longevity');

        // Edit Pass 'document_is_permit_or_provisional_license' rule by adding an is not field
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');

        const addFieldButton = within(passRow).getByRole('button', {
          name: 'Add risk signal condition',
        });
        await userEvent.click(addFieldButton);
        expect(addFieldButton).toBeDisabled();
        expect(within(failRow).getByText('Pending change')).toBeInTheDocument();

        const newOpTrigger = within(passRow).getAllByText('is')[1];
        await userEvent.click(newOpTrigger);
        const passIsOption = await screen.findByRole('option', {
          name: 'is',
        });
        expect(passIsOption).toBeInTheDocument();
        await selectOption('is not');

        const passSelectTrigger = within(passRow).getByText('risk signal');
        await userEvent.click(passSelectTrigger);
        const riskSignalListbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(riskSignalListbox).toBeInTheDocument();

        const riskSignalInput = within(riskSignalListbox).getByRole('combobox');
        await userEvent.type(riskSignalInput, 'name_matches');

        const option = await within(riskSignalListbox).findByText('name_matches');
        expect(option).toBeInTheDocument();
        await selectOption('name_matches');

        // Save edits
        const backtestButton = screen.getByRole('button', {
          name: 'Test changes',
        });
        await userEvent.click(backtestButton);
        const saveButton = screen.getByRole('button', {
          name: 'Save changes',
        });
        expect(saveButton).toBeInTheDocument();
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(saveButton).not.toBeInTheDocument();
        });

        // // New rules are displayed
        const editedFailSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(editedFailSection).getAllByRole('row');
        expect(failRows).toHaveLength(4);
        expect(within(failRows[0]).getByText('address_alert_longevity')).toBeInTheDocument();
        expect(
          isNotTriggered({
            row: failRows[0],
            text: 'address_alert_longevity',
          }),
        ).toEqual(true);

        const editedPassSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const newPassRow = within(editedPassSection).getByRole('row');
        const newRiskSignal = within(newPassRow).getByText('document_is_permit_or_provisional_license');
        expect(newRiskSignal).toBeInTheDocument();
        expect(within(newPassRow).getByText('name_matches')).toBeInTheDocument();
        expect(
          isNotTriggered({
            row: newPassRow,
            text: 'name_matches',
          }),
        ).toEqual(true);

        expect(screen.queryAllByText('Pending change').length).toEqual(0);
      });

      it('should delete and add multiple rules correctly', async () => {
        withEditRules([
          ...rulesFixture.slice(1, 4),
          stepUpRuleFixture,
          {
            ...manualReviewRuleFixture,
            ruleId: 'newId',
            ruleExpression: [{ field: 'id_flagged', op: RiskSignalRuleOp.eq, value: true }],
          },
        ]);
        withEvaluateRules();
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Delete Fail 'id_flagged' rule
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const [failRow] = within(failSection).getAllByRole('row');
        const failRowDeleteButton = within(failRow).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(failRowDeleteButton);
        const failPendingDeleteText = await within(failRow).findByText('Pending deletion');
        expect(failPendingDeleteText).toBeInTheDocument();

        // Delete Pass 'document_is_permit_or_provisional_license' rule
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');
        const passRowDeleteButton = within(passRow).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(passRowDeleteButton);
        const passPendingDeleteText = await within(passRow).findByText('Pending deletion');
        expect(passPendingDeleteText).toBeInTheDocument();

        // // Add 'dob_does_not_match' rule to empty Step-up section
        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        const stepUpAddButton = within(stepUpSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(stepUpAddButton);

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
        const listbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(listbox).toBeInTheDocument();

        const input = within(listbox).getByRole('combobox');
        await userEvent.type(input, 'dob_does_not_match');

        const option = await within(listbox).findByText('dob_does_not_match');
        expect(option).toBeInTheDocument();
        await selectOption('dob_does_not_match');

        // // Add 'id_flagged' rule to Manual review
        const manRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevAddButton = within(manRevSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(manRevAddButton);
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

        const manRevListbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(manRevListbox).toBeInTheDocument();
        const manRevInput = within(manRevListbox).getByRole('combobox');
        await userEvent.type(manRevInput, 'id_flagged');

        const manRevOption = await within(manRevListbox).findByText('id_flagged');
        expect(manRevOption).toBeInTheDocument();
        await selectOption('id_flagged');

        // // Save edits
        const backtestButton = screen.getByRole('button', {
          name: 'Test changes',
        });
        await userEvent.click(backtestButton);
        const saveButton = screen.getByRole('button', {
          name: 'Save changes',
        });
        expect(saveButton).toBeInTheDocument();
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(saveButton).not.toBeInTheDocument();
        });

        // // New rules are displayed
        const editedStepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        const newStepUpRiskSignal = within(within(editedStepUpSection).getByRole('row')).getByText(
          'dob_does_not_match',
        );
        expect(newStepUpRiskSignal).toBeInTheDocument();

        const editedManRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevRows = within(editedManRevSection).getAllByRole('row');
        expect(manRevRows.length).toEqual(2);
        expect(within(manRevRows[1]).getByText('id_flagged')).toBeInTheDocument();
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
        const isOption = await screen.findByRole('option', {
          name: 'is',
        });
        expect(isOption).toBeInTheDocument();
        await selectOption('is not');
        const pendingChangeText = await within(failRows[0]).findByText('Pending change');
        expect(pendingChangeText).toBeInTheDocument();

        const failSelectTrigger = within(failRows[0]).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        const listbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(listbox).toBeInTheDocument();

        const input = within(listbox).getByRole('combobox');
        await userEvent.type(input, 'address_alert_longevity');

        const option = await within(listbox).findByText('address_alert_longevity');
        expect(option).toBeInTheDocument();
        await selectOption('address_alert_longevity');

        const undoButton1 = within(failRows[0]).getByRole('button', {
          name: 'undo',
        });
        await userEvent.click(undoButton1);
        await waitFor(() => {
          expect(undoButton1).not.toBeInTheDocument();
        });

        // Test should be disabled since there are no edits
        const submitButton = screen.getByRole('button', {
          name: 'Test changes',
        });
        await waitFor(() => {
          expect(submitButton).toBeDisabled();
        });

        // Delete Fail 'subject_deceased' rule, then undo
        const deleteButton = within(failRows[2]).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(deleteButton);
        const pendingDeleteText = await within(failRows[2]).findByText('Pending deletion');
        expect(pendingDeleteText).toBeInTheDocument();

        const undoButton2 = within(failRows[2]).getByRole('button', {
          name: 'undo',
        });
        await userEvent.click(undoButton2);
        await waitFor(() => {
          expect(undoButton2).not.toBeInTheDocument();
        });

        // Test should be disabled since there are no edits
        await waitFor(() => {
          expect(submitButton).toBeDisabled();
        });

        // Add rule to Manual review, then delete it before saving
        const manRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const manRevAddButton = within(manRevSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(manRevAddButton);
        const manRevRows = within(manRevSection).getAllByRole('row');
        await waitFor(() => {
          expect(manRevRows.length).toEqual(2);
        });
        const newRowDeleteButton = within(manRevRows[1]).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(newRowDeleteButton);
        const newManRevRows = await within(manRevSection).findAllByRole('row');
        expect(newManRevRows.length).toEqual(1);

        // Test should be disabled since there are no edits
        await waitFor(() => {
          expect(submitButton).toBeDisabled();
        });
      });

      it.skip('should cancel edits, adds, and deletes correctly', async () => {
        await renderRulesAndWaitFinishLoading();
        await startEditing();

        // Edit Fail 'id_flagged' rule's op and field
        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const failRows = within(failSection).getAllByRole('row');

        const opSelectTrigger = within(failRows[0]).getByText('is');
        await userEvent.click(opSelectTrigger);
        const isOption = await screen.findByRole('option', {
          name: 'is',
        });
        expect(isOption).toBeInTheDocument();
        await selectOption('is not');
        const pendingChangeText = await within(failRows[0]).findByText('Pending change');
        expect(pendingChangeText).toBeInTheDocument();

        const failSelectTrigger = within(failRows[0]).getByText('id_flagged');
        await userEvent.click(failSelectTrigger);
        const listbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(listbox).toBeInTheDocument();

        const input = within(listbox).getByRole('combobox');
        await userEvent.type(input, 'address_alert_longevity');

        const option = await within(listbox).findByText('address_alert_longevity');
        expect(option).toBeInTheDocument();
        await selectOption('address_alert_longevity');

        // Delete Fail 'subject_deceased' rule
        const failRowDeleteButton = within(failRows[2]).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(failRowDeleteButton);
        const failPendingDeleteText = await within(failRows[2]).findByText('Pending deletion');
        expect(failPendingDeleteText).toBeInTheDocument();

        // Delete Pass 'document_is_permit_or_provisional_license' rule
        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const passRow = within(passSection).getByRole('row');
        const passRowDeleteButton = within(passRow).getByRole('button', {
          name: 'delete',
        });
        await userEvent.click(passRowDeleteButton);
        const passPendingDeleteText = await within(passRow).findByText('Pending deletion');
        expect(passPendingDeleteText).toBeInTheDocument();

        // Add 'dob_does_not_match' rule to empty Step-up section
        const stepUpSection = screen.getByRole('group', {
          name: 'Step-up',
        });
        const stepUpAddButton = within(stepUpSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(stepUpAddButton);
        await waitFor(() => {
          const noRulesText = within(stepUpSection).queryByText('No rule has been configured');
          expect(noRulesText).not.toBeInTheDocument();
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

        const riskSignalListbox = screen.getByRole('listbox', {
          name: 'Risk signal options',
        });
        expect(riskSignalListbox).toBeInTheDocument();

        const riskSignalInput = within(riskSignalListbox).getByRole('combobox');
        await userEvent.type(riskSignalInput, 'dob_does_not_match');

        const riskSignalOption = await within(riskSignalListbox).findByText('dob_does_not_match');
        expect(riskSignalOption).toBeInTheDocument();
        await selectOption('dob_does_not_match');

        // Cancel changes
        const cancelButton = screen.getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);

        // No changes are made
        expect(screen.queryAllByText('Pending change').length).toEqual(0);
        expect(screen.queryAllByText('Pending deletion').length).toEqual(0);

        expect(within(failSection).getAllByRole('row')).toHaveLength(4);
        expect(within(failRows[0]).getByText('id_flagged')).toBeInTheDocument();
        expect(within(failRows[2]).getByText('subject_deceased')).toBeInTheDocument();

        const passRows = within(passSection).getAllByRole('row');
        expect(passRows).toHaveLength(1);

        expect(within(stepUpSection).getByText('No rule has been configured')).toBeInTheDocument();
      });
    });
  });

  describe('when it is a KYB playbook', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl(`/playbooks/${kybPlaybookFixture.id}`);
      mockRouter.query = {
        id: kybPlaybookFixture.id,
      };
      withRules(kybPlaybookFixture.id);
      withLists();
    });

    it('should show an alert', async () => {
      await renderRules({ playbook: kybPlaybookFixture });

      const alert = await screen.findByText('These rules apply to Business Owners and Businesses');
      expect(alert).toBeInTheDocument();
    });
  });
});
