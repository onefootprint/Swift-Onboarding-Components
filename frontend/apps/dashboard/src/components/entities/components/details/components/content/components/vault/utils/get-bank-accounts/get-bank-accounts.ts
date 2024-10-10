import type { Entity, EntityBankAccount } from '@onefootprint/types';

const getBankAccounts = (entity: Entity): EntityBankAccount[] => {
  if (!Object.keys(entity.data).length) {
    return [];
  }
  const bankAccounts: Record<string, EntityBankAccount> = {};
  entity.data.forEach(attribute => {
    if (attribute.identifier.startsWith('bank')) {
      const [, alias, field] = attribute.identifier.split('.');
      if (alias && field) {
        bankAccounts[alias] = { ...bankAccounts[alias], [field]: attribute.value };
      }
    }
  });

  return Object.entries(bankAccounts)
    .filter(([alias, account]) => alias !== 'undefined' && Object.keys(account).length > 0)
    .sort(([aliasA], [aliasB]) => aliasA.localeCompare(aliasB))
    .map(([alias, account]) => ({ ...account, alias }));
};

export default getBankAccounts;
