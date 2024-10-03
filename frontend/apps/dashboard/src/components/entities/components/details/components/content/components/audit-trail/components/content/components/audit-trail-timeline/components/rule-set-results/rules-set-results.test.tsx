import { customRender, screen, userEvent, within } from '@onefootprint/test-utils';

import type { RuleSetResultsProps } from './rule-set-results';
import RuleSetResults from './rule-set-results';
import { ruleResultResponseFixture, withLists } from './rules-set-results.test.config';

const renderRules = ({ data, isPending, errorMessage }: RuleSetResultsProps) =>
  customRender(<RuleSetResults data={data} isPending={isPending} errorMessage={errorMessage} />);

describe('<Rules />', () => {
  describe('when data is passed in', () => {
    beforeEach(() => {
      withLists();
    });

    it('should show only triggered rules by default', () => {
      renderRules({ data: ruleResultResponseFixture, isPending: false });

      const failSection = screen.getByRole('group', {
        name: 'Fail',
      });
      expect(within(failSection).getAllByRole('row')).toHaveLength(2);
      expect(within(failSection).getByText('subject_deceased')).toBeInTheDocument();
      expect(within(failSection).getByText('name_matches')).toBeInTheDocument();

      const stepUpSection = screen.getByRole('group', {
        name: 'Step-up',
      });
      const identitySsnSubSection = within(stepUpSection).getByRole('group', {
        name: 'Identity document and Proof of SSN',
      });
      expect(within(identitySsnSubSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(identitySsnSubSection).getByText('None')).toBeInTheDocument();
      const poaSubSection = within(stepUpSection).getByRole('group', {
        name: 'Proof of Address',
      });
      expect(within(poaSubSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(poaSubSection).getByText('None')).toBeInTheDocument();
      const identitySubSection = within(stepUpSection).getByRole('group', {
        name: 'Identity document',
      });
      expect(within(identitySubSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(identitySubSection).getByText('None')).toBeInTheDocument();

      const manRevSection = screen.getByRole('group', {
        name: 'Fail + Manual review',
      });
      expect(within(manRevSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(manRevSection).getByText('None')).toBeInTheDocument();

      const passManRevSection = screen.getByRole('group', {
        name: 'Pass + Manual review',
      });
      expect(within(passManRevSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(passManRevSection).getByText('None')).toBeInTheDocument();
    });

    it('should show only not triggered rules when that select option is selected', async () => {
      renderRules({ data: ruleResultResponseFixture, isPending: false });

      const failSection = screen.getByRole('group', {
        name: 'Fail',
      });
      await userEvent.click(within(failSection).getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: 'Rules not present' }));
      expect(within(failSection).getAllByRole('row')).toHaveLength(1);
      expect(within(failSection).getByText('id_flagged')).toBeInTheDocument();

      const stepUpSection = screen.getByRole('group', {
        name: 'Step-up',
      });
      await userEvent.click(within(stepUpSection).getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: 'Rules not present' }));

      const identitySsnSubSection = within(stepUpSection).getByRole('group', {
        name: 'Identity document and Proof of SSN',
      });
      expect(within(identitySsnSubSection).getAllByRole('row')).toHaveLength(1);
      expect(within(identitySsnSubSection).getByText('dob_does_not_match')).toBeInTheDocument();

      const poaSubSection = within(stepUpSection).getByRole('group', {
        name: 'Proof of Address',
      });
      expect(within(poaSubSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(poaSubSection).getByText('None')).toBeInTheDocument();

      const identitySubSection = within(stepUpSection).getByRole('group', {
        name: 'Identity document',
      });
      expect(within(identitySubSection).queryAllByRole('row')).toHaveLength(0);
      expect(within(identitySubSection).getByText('None')).toBeInTheDocument();

      const manRevSection = screen.getByRole('group', {
        name: 'Fail + Manual review',
      });
      await userEvent.click(within(manRevSection).getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: 'Rules not present' }));
      expect(within(manRevSection).getAllByRole('row')).toHaveLength(1);
      expect(within(manRevSection).getByText('watchlist_hit_ofac')).toBeInTheDocument();

      const passManRevSection = screen.getByRole('group', {
        name: 'Pass + Manual review',
      });
      await userEvent.click(within(passManRevSection).getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: 'Rules not present' }));
      expect(within(passManRevSection).getAllByRole('row')).toHaveLength(1);
      expect(within(passManRevSection).getByText('document_is_permit_or_provisional_license')).toBeInTheDocument();
    });
  });

  describe('when isPending is true', () => {
    it('should show a loading icon', async () => {
      renderRules({ isPending: true });

      const loading = await screen.findByRole('progressbar', {
        name: 'Loading...',
      });
      expect(loading).toBeInTheDocument();
    });
  });

  describe('when an error message is passed in', () => {
    it('should show an error message', async () => {
      renderRules({
        isPending: false,
        errorMessage: 'Something went wrong',
      });

      const error = screen.getByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });
});
