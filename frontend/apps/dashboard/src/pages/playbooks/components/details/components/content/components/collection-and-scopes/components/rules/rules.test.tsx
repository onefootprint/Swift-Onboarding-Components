import {
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import { OnboardingConfigKind, RuleOp } from '@onefootprint/types';
import React from 'react';
import { asAdminUserFirmEmployee } from 'src/config/tests';

import type { RulesProps } from './rules';
import Rules from './rules';
import {
  isPrecededByNotBadge,
  kybPlaybookIdFixture,
  kycPlaybookFixture,
  passRuleFixture,
  rulesFixture,
  stepUpRuleFixture,
  withAddRule,
  withDeleteRule,
  withEditRule,
  withRiskSignals,
  withRules,
  withRulesError,
} from './rules.test.config';

const renderRules = (
  { playbookId, playbookKind }: RulesProps = {
    playbookId: kycPlaybookFixture.id,
    playbookKind: OnboardingConfigKind.kyc,
  },
) => {
  customRender(<Rules playbookId={playbookId} playbookKind={playbookKind} />);
};

const renderRulesAndWaitFinishLoading = async () => {
  renderRules();

  await waitFor(() => {
    const loader = screen.getByRole('progressbar', {
      name: 'Loading...',
    });
    expect(loader).toBeInTheDocument();
  });

  await waitForElementToBeRemoved(() =>
    screen.queryByRole('progressbar', {
      name: 'Loading...',
    }),
  );
};

describe('<Rules />', () => {
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

      it("should edit 'not', the risk signal code, and added codes correctly", async () => {
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
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const failSection = screen.getByRole('group', {
          name: 'Fail',
        });
        const firstRuleRow = within(failSection).queryAllByRole('row')[0];

        const editButton = within(firstRuleRow).getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
          expect(editButton).not.toBeInTheDocument();
        });

        // Toggle not badge
        const notBadge = within(firstRuleRow).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });

        // Edit id_flagged field to be id_not_located
        const fieldDropdown = within(firstRuleRow).getByText('id_flagged');
        await userEvent.click(fieldDropdown);
        await waitFor(() => {
          expect(
            within(firstRuleRow).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await userEvent.click(within(firstRuleRow).getByText('id_not_located'));
        await waitFor(() => {
          expect(
            within(firstRuleRow).queryByText('Risk signals'),
          ).not.toBeInTheDocument();
        });

        // Add adverse_media_hit field
        const addFieldButton = within(firstRuleRow).getByRole('button', {
          name: 'add',
        });
        await userEvent.click(addFieldButton);
        await waitFor(() => {
          expect(
            within(firstRuleRow).getByText('Select...'),
          ).toBeInTheDocument();
        });
        const newDropdown = within(firstRuleRow).getByText('Select...');
        await userEvent.click(newDropdown);
        await waitFor(() => {
          expect(
            within(firstRuleRow).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await userEvent.click(
          within(firstRuleRow).getByText('adverse_media_hit'),
        );
        await waitFor(() => {
          expect(
            within(firstRuleRow).queryByText('Risk signals'),
          ).not.toBeInTheDocument();
        });

        const saveButton = within(firstRuleRow).getByRole('button', {
          name: 'Save',
        });
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(saveButton).not.toBeInTheDocument();
        });

        expect(
          isPrecededByNotBadge({
            row: within(failSection).queryAllByRole('row')[0],
            text: 'id_not_located',
          }),
        ).toEqual(true);
        const nots = screen.queryAllByText('not');
        expect(nots).toHaveLength(2);
        expect(
          within(firstRuleRow).getByText('id_not_located'),
        ).toBeInTheDocument();
        expect(
          within(firstRuleRow).getByText('adverse_media_hit'),
        ).toBeInTheDocument();
      });

      it('should cancel editing the not toggle correctly', async () => {
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const manualRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const ruleRow = within(manualRevSection).getByRole('row');

        const editButton = within(ruleRow).getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
          expect(editButton).not.toBeInTheDocument();
        });

        const notBadge = within(ruleRow).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });

        const cancelButton = within(ruleRow).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });

        const nots = within(manualRevSection).queryAllByText('not');
        expect(nots).toHaveLength(0);
      });

      it('should cancel editing the risk signal code correctly', async () => {
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const manualRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const ruleRow = within(manualRevSection).getByRole('row');

        const editButton = within(ruleRow).getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
          expect(editButton).not.toBeInTheDocument();
        });

        const fieldDropdown = within(ruleRow).getByText('watchlist_hit_ofac');
        await userEvent.click(fieldDropdown);
        await waitFor(() => {
          expect(
            within(ruleRow).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await userEvent.click(within(ruleRow).getByText('subject_deceased'));
        await waitFor(() => {
          expect(
            within(ruleRow).queryByText('Risk signals'),
          ).not.toBeInTheDocument();
        });

        const cancelButton = within(ruleRow).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });

        expect(
          within(ruleRow).queryByText('subject_deceased'),
        ).not.toBeInTheDocument();
      });

      it('should delete a rule correctly', async () => {
        withDeleteRule(passRuleFixture.ruleId);
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const ruleRow = within(passSection).getByRole('row');

        const editButton = within(ruleRow).getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
          expect(editButton).not.toBeInTheDocument();
        });

        const deleteButton = within(ruleRow).getByText('Delete rule');
        await userEvent.click(deleteButton);
        await waitFor(() => {
          expect(
            within(ruleRow).queryByText('Delete rule'),
          ).not.toBeInTheDocument();
        });
        await waitFor(() => {
          expect(screen.getByText('Success!')).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(screen.getByText('Rule deleted.')).toBeInTheDocument();
        });
      });

      it('should add a rule to an empty section correctly', async () => {
        withAddRule(stepUpRuleFixture);
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

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
        const fieldDropdown = within(newRuleRow).getByText('Select...');
        await userEvent.click(fieldDropdown);
        await waitFor(() => {
          expect(
            within(newRuleRow).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await userEvent.click(
          within(newRuleRow).getByText('dob_does_not_match'),
        );
        await waitFor(() => {
          expect(
            within(newRuleRow).queryByText('Risk signals'),
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
          expect(screen.getByText('Success!')).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(screen.getByText('Rule added.')).toBeInTheDocument();
        });
      });

      it('should cancel an added rule correctly', async () => {
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const passSection = screen.getByRole('group', {
          name: 'Pass + Manual review',
        });
        const addRuleButton = within(passSection).getByRole('button', {
          name: 'Add rule',
        });
        await userEvent.click(addRuleButton);
        await waitFor(() => {
          expect(addRuleButton).toBeDisabled();
        });

        const newRuleRow = within(passSection).queryAllByRole('row')[1];
        const notBadge = within(newRuleRow).getByText('not');
        await userEvent.click(notBadge);
        await waitFor(() => {
          expect(notBadge).toHaveAttribute('data-is-selected', 'true');
        });
        const fieldDropdown = within(newRuleRow).getByText('Select...');
        await userEvent.click(fieldDropdown);
        await waitFor(() => {
          expect(
            within(newRuleRow).getByText('address_alert_longevity'),
          ).toBeInTheDocument();
        });
        await userEvent.click(within(newRuleRow).getByText('name_matches'));
        await waitFor(() => {
          expect(
            within(newRuleRow).queryByText('Risk signals'),
          ).not.toBeInTheDocument();
        });

        const cancelButton = within(newRuleRow).getByRole('button', {
          name: 'Cancel',
        });
        await userEvent.click(cancelButton);
        await waitFor(() => {
          expect(cancelButton).not.toBeInTheDocument();
        });

        const nots = within(passSection).queryAllByText('not');
        expect(nots).toHaveLength(0);
        expect(
          within(passSection).queryByText('name_matches'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('when it is a KYB playbook', () => {
    it('should show an alert', async () => {
      withRules(kybPlaybookIdFixture);
      await renderRules({
        playbookId: kybPlaybookIdFixture,
        playbookKind: OnboardingConfigKind.kyb,
      });
      await waitFor(() => {
        const alert = screen.getByText(
          "These rules are only applied when verifying a Business Owner's identity.",
        );
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
