import { customRender, screen, within } from '@onefootprint/test-utils';
import React from 'react';

import type { RulesProps } from './rules';
import Rules from './rules';
import { ruleResultResponseFixture } from './rules.test.config';

const renderRules = ({ data, isLoading, errorMessage }: RulesProps) =>
  customRender(
    <Rules data={data} isLoading={isLoading} errorMessage={errorMessage} />,
  );

describe('<Rules />', () => {
  describe('when data is passed in', () => {
    it('should show all triggered and not triggered rules in the correct sections', () => {
      renderRules({ data: ruleResultResponseFixture, isLoading: false });

      const failSection = screen.getByRole('group', {
        name: 'Fail',
      });
      const failRows = within(failSection).getAllByRole('row');
      expect(failRows).toHaveLength(3);

      const failTriggered = within(failSection).getByRole('group', {
        name: 'Rules triggered',
      });
      const failTriggeredRows = within(failTriggered).getAllByRole('row');
      expect(failTriggeredRows).toHaveLength(2);
      expect(
        within(failTriggered).getByText('subject_deceased'),
      ).toBeInTheDocument();
      expect(
        within(failTriggered).getByText('name_matches'),
      ).toBeInTheDocument();

      const failNotTriggered = within(failSection).getByRole('group', {
        name: 'Rules not triggered',
      });
      const failNotTriggeredRows = within(failNotTriggered).getAllByRole('row');
      expect(failNotTriggeredRows).toHaveLength(1);
      expect(
        within(failNotTriggered).getByText('id_flagged'),
      ).toBeInTheDocument();

      const manRevSection = screen.getByRole('group', {
        name: 'Fail + Manual review',
      });
      const manRevRows = within(manRevSection).getAllByRole('row');
      expect(manRevRows).toHaveLength(1);

      const manRevTriggered = within(manRevSection).getByRole('group', {
        name: 'Rules triggered',
      });
      expect(within(manRevTriggered).queryAllByRole('row')).toHaveLength(0);
      expect(within(manRevTriggered).getByText('None')).toBeInTheDocument();

      const manRevNotTriggered = within(manRevSection).getByRole('group', {
        name: 'Rules not triggered',
      });
      const manRevNotTriggeredRows =
        within(manRevNotTriggered).getAllByRole('row');
      expect(manRevNotTriggeredRows).toHaveLength(1);
      expect(
        within(manRevNotTriggered).getByText('watchlist_hit_ofac'),
      ).toBeInTheDocument();

      const stepUpSection = screen.getByRole('group', {
        name: 'Step-up',
      });
      const stepUpRows = within(stepUpSection).queryAllByRole('row');
      expect(stepUpRows).toHaveLength(0);

      const stepUpTriggered = within(stepUpSection).getByRole('group', {
        name: 'Rules triggered',
      });
      expect(within(stepUpTriggered).queryAllByRole('row')).toHaveLength(0);
      expect(within(stepUpTriggered).getByText('None')).toBeInTheDocument();

      const stepUpNotTriggered = within(stepUpSection).getByRole('group', {
        name: 'Rules not triggered',
      });
      expect(within(stepUpNotTriggered).queryAllByRole('row')).toHaveLength(0);
      expect(within(stepUpNotTriggered).getByText('None')).toBeInTheDocument();

      const passManRevSection = screen.getByRole('group', {
        name: 'Pass + Manual review',
      });
      const passManRevRows = within(passManRevSection).getAllByRole('row');
      expect(passManRevRows).toHaveLength(1);

      const passManRevTriggered = within(passManRevSection).getByRole('group', {
        name: 'Rules triggered',
      });
      expect(within(passManRevTriggered).queryAllByRole('row')).toHaveLength(0);
      expect(within(passManRevTriggered).getByText('None')).toBeInTheDocument();

      const passManRevNotTriggered = within(passManRevSection).getByRole(
        'group',
        {
          name: 'Rules not triggered',
        },
      );
      const passManRevNotTriggeredRows = within(
        passManRevNotTriggered,
      ).getAllByRole('row');
      expect(passManRevNotTriggeredRows).toHaveLength(1);
      expect(
        within(passManRevNotTriggered).getByText(
          'document_is_permit_or_provisional_license',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('when isLoading is true', () => {
    it('should show a loading icon', async () => {
      renderRules({ isLoading: true });

      const loading = await screen.findByRole('progressbar', {
        name: 'Loading...',
      });
      expect(loading).toBeInTheDocument();
    });
  });

  describe('when an error message is passed in', () => {
    it('should show an error message', async () => {
      renderRules({
        isLoading: false,
        errorMessage: 'Something went wrong',
      });

      const error = screen.getByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });
});
