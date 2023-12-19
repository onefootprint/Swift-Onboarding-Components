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
  manualReviewRuleFixture,
  passRuleFixture,
  withDeleteRule,
  withEditRule,
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
        expect(
          within(failRows[0]).getByText('document_not_verified'),
        ).toBeInTheDocument();
        expect(
          within(failRows[0]).getByText('ssn_does_not_match'),
        ).toBeInTheDocument();
        expect(
          within(failRows[0]).getByText('name_matches'),
        ).toBeInTheDocument();
        expect(
          isPrecededByNotBadge({
            row: failRows[0],
            text: 'name_matches',
          }),
        ).toEqual(true);
        expect(within(failRows[1]).getByText('id_flagged')).toBeInTheDocument();
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

      it("should edit a rule by toggling 'not' correctly", async () => {
        withEditRule({
          ...manualReviewRuleFixture,
          ruleExpression: [
            {
              field: 'watchlist_hit_ofac',
              op: RuleOp.notEq,
              value: true,
            },
          ],
        });
        asAdminUserFirmEmployee();
        await renderRulesAndWaitFinishLoading();

        const manRevSection = screen.getByRole('group', {
          name: 'Fail + Manual review',
        });
        const ruleRow = within(manRevSection).getByRole('row');

        const editButton = within(ruleRow).getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
          expect(editButton).not.toBeInTheDocument();
        });

        const editableNotBadge = within(ruleRow).getByText('not');
        await userEvent.click(editableNotBadge);
        await waitFor(() => {
          expect(editableNotBadge).toHaveAttribute('data-is-selected', 'true');
        });

        const saveButton = within(ruleRow).getByText('Save');
        await userEvent.click(saveButton);
        await waitFor(() => {
          expect(saveButton).not.toBeInTheDocument();
        });

        expect(
          isPrecededByNotBadge({
            row: within(manRevSection).getByRole('row'),
            text: 'watchlist_hit_ofac',
          }),
        ).toEqual(true);

        const nots = screen.queryAllByText('not');
        expect(nots).toHaveLength(2);
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
