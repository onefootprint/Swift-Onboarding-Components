import { screen } from '@onefootprint/test-utils';
import userEvent from '@testing-library/user-event';
import { renderFinancialFieldset } from './financial-fieldset.test.config';

import { bankAccountEntity, bothEntity, cardEntity } from './financial-fieldset.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('Fieldset', () => {
  it('renders the title and icon', () => {
    renderFinancialFieldset();
    const title = screen.getByText('Financial data');
    expect(title).toBeInTheDocument();
    const icon = screen.getByLabelText('test icon');
    expect(icon).toBeInTheDocument();
  });

  it('displays the SegmentedControl when both cards and bank accounts are present', () => {
    renderFinancialFieldset();
    const segmentedControl = screen.getByRole('tablist', { name: 'Select between cards and bank accounts' });
    expect(segmentedControl).toBeInTheDocument();
  });

  it('does not display the SegmentedControl when only cards are present', () => {
    renderFinancialFieldset({ entity: cardEntity });
    const segmentedControl = screen.queryByRole('tablist', { name: 'Select between cards and bank accounts' });
    expect(segmentedControl).not.toBeInTheDocument();
  });

  it('does not display the SegmentedControl when only bank accounts are present', () => {
    renderFinancialFieldset({ entity: bankAccountEntity });
    const segmentedControl = screen.queryByRole('tablist', { name: 'Select between cards and bank accounts' });
    expect(segmentedControl).not.toBeInTheDocument();
  });

  it('switches between cards and bank accounts when SegmentedControl is toggled', async () => {
    renderFinancialFieldset();

    const cardOption = screen.getByRole('button', { name: 'Cards' });
    const bankAccountOption = screen.getByRole('button', { name: 'Bank accounts' });
    expect(cardOption.getAttribute('aria-selected')).toBe('true');
    expect(bankAccountOption.getAttribute('aria-selected')).toBe('false');

    await userEvent.click(bankAccountOption);

    expect(cardOption.getAttribute('aria-selected')).toBe('false');
    expect(bankAccountOption.getAttribute('aria-selected')).toBe('true');
  });

  it('renders card fields when cards are selected', () => {
    // will default to cards
    renderFinancialFieldset({ entity: bothEntity });
    const issuerField = screen.getByText('Issuer');
    const numberField = screen.getByText('Card number');
    expect(issuerField).toBeInTheDocument();
    expect(numberField).toBeInTheDocument();
  });

  it('renders bank account fields when bank accounts are selected', async () => {
    renderFinancialFieldset({ entity: bothEntity });

    const bankAccountOption = screen.getByRole('button', { name: 'Bank accounts' });
    await userEvent.click(bankAccountOption);

    const accountNumberField = screen.getByText('ACH account number');
    const routingNumberField = screen.getByText('ACH routing number');
    expect(accountNumberField).toBeInTheDocument();
    expect(routingNumberField).toBeInTheDocument();
  });
});
