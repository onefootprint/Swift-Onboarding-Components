import type { Entity, EntityBankAccount } from '@onefootprint/types';

const getBankAccounts = (entity: Entity): EntityBankAccount[] => {
  if (!entity.attributes.length && !Object.keys(entity.decryptedAttributes).length) {
    return [];
  }
  const bankAccounts: Record<string, EntityBankAccount> = {};
  entity.attributes.forEach(key => {
    if (key.startsWith('bank')) {
      const [, alias, field] = key.split('.');
      bankAccounts[alias] = { ...bankAccounts[alias], [field]: null };
    }
  });
  Object.entries(entity.decryptedAttributes).forEach(([key, value]) => {
    if (key.startsWith('bank')) {
      const [, alias, field] = key.split('.');
      bankAccounts[alias] = { ...bankAccounts[alias], [field]: value };
    }
  });
  return Object.entries(bankAccounts).map(([alias, account]) => ({ ...account, alias }));
};

export default getBankAccounts;
