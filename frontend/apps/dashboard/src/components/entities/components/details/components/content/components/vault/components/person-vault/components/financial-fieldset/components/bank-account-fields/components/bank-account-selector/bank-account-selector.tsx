import type { EntityBankAccount } from '@onefootprint/types';
import { SelectCustom } from '@onefootprint/ui';

export type BankAccountSelectorProps = {
  selected?: EntityBankAccount;
  onChange: (item: EntityBankAccount) => void;
  bankAccounts: EntityBankAccount[];
};

export const BankAccountSelector = ({ selected, onChange, bankAccounts }: BankAccountSelectorProps) => {
  const handleChange = (newValue: string) => {
    const newItem = bankAccounts.find(item => item.alias === newValue);
    if (newItem) {
      onChange(newItem);
    }
  };

  return (
    <SelectCustom.Root value={selected?.alias || ''} onValueChange={handleChange}>
      <SelectCustom.Input size="compact">{selected?.alias}</SelectCustom.Input>
      <SelectCustom.Content>
        <SelectCustom.Group>
          {bankAccounts.map(bankAccount => (
            <SelectCustom.Item key={bankAccount.alias} value={bankAccount.alias || ''}>
              {bankAccount.alias}
            </SelectCustom.Item>
          ))}
        </SelectCustom.Group>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default BankAccountSelector;
