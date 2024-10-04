import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import type { BankAccountSelectorProps } from './bank-account-selector';
import BankAccountSelector from './bank-account-selector';
import { defaultBankAccount } from './bank-account-selector.test.config';

describe('<BankAccountSelector>', () => {
  const renderSelector = (props: BankAccountSelectorProps) => customRender(<BankAccountSelector {...props} />);

  it('should display bank account alias', () => {
    const currentBankAccount = {
      ...defaultBankAccount,
      alias: 'Checking Account',
    };

    renderSelector({
      bankAccounts: [currentBankAccount],
      selected: currentBankAccount,
      onChange: () => undefined,
    });

    const element = screen.getByText('Checking Account');
    expect(element).toBeInTheDocument();
  });

  it('should display other bank accounts in dropdown', async () => {
    const bankAccounts = [
      { ...defaultBankAccount, alias: 'Checking Account' },
      { ...defaultBankAccount, alias: 'Savings Account' },
      { ...defaultBankAccount, alias: 'Business Account' },
    ];
    renderSelector({
      bankAccounts,
      selected: bankAccounts[0],
      onChange: () => undefined,
    });

    const dropdownTrigger = screen.getByRole('combobox');
    await userEvent.click(dropdownTrigger);
    const savingsAccount = await screen.findByText('Savings Account');
    expect(savingsAccount).toBeInTheDocument();
    const businessAccount = await screen.findByText('Business Account');
    expect(businessAccount).toBeInTheDocument();
  });
});
