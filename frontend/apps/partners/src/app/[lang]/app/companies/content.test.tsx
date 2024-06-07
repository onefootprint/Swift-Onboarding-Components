import { afterEach, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react'; // eslint-disable-line testing-library/no-manual-cleanup
import userEvent from '@testing-library/user-event';
import React from 'react';

import { nextNavigation, pushMock } from '@/test/modules';
import { WithDesignSystem, withTranslations } from '@/test/providers';
import { companies } from '@/test/responses';

import CompaniesContent from './content';

mock.module('next/navigation', nextNavigation);

const renderWithI18n = withTranslations.bind(null, render);

afterEach(cleanup);

it('renders component with empty companies array', () => {
  render(
    <WithDesignSystem>
      <CompaniesContent companies={[]} />
    </WithDesignSystem>,
  );

  screen.getByText('companies.company-empty-state'); // getByText throws an error if no element is found
});

it('renders component with a list of companies', () => {
  render(
    <WithDesignSystem>
      <CompaniesContent companies={companies} />
    </WithDesignSystem>,
  );

  expect(screen.getByText('QuantumWorks Inc.')).toBeTruthy();
  expect(screen.getByText('PhoenixX Innovations')).toBeTruthy();
});

it('simulates clicking on a row in the table', async () => {
  await renderWithI18n(<CompaniesContent companies={companies} />);
  await userEvent.click(screen.getByLabelText('QuantumWorks Inc.'));

  expect(pushMock.mock.lastCall).toEqual(['/app/companies/c_123']);
});
