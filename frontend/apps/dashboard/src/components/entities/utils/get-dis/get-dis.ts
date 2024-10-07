import type { DataIdentifier, EntityVault } from '@onefootprint/types';

const cardOrder: Record<string, number> = {
  issuer: 1,
  name: 2,
  number: 3,
  expiration: 4,
  cvc: 5,
  billing_address: 6,
  fingerprint: 7,
};

const bankOrder: Record<string, number> = {
  name: 1,
  account_type: 2,
  ach_account_id: 3,
  ach_account_number: 4,
  ach_routing_number: 5,
  fingerprint: 6,
};

const filterCards = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const hiddenAttributes = ['expiration_month', 'expiration_year', 'number_last4'];
  return attributes.filter(
    attr => attr.includes(`card.${search}`) && !hiddenAttributes.some(hiddenAttr => attr.includes(hiddenAttr)),
  );
};

const filterBankAccounts = (attributes: DataIdentifier[], search: string | null | undefined) => {
  return attributes.filter(attr => attr.includes(`bank.${search}`));
};

export const getDI = (target: string) => {
  if (target.startsWith('card')) {
    const cardAlias = target.split('.')[1];
    return `di.${target.replace(`${cardAlias}.`, 'verbose.')}`;
  }
  if (target.startsWith('custom')) {
    return target;
  }
  return `di.${target}`;
};

const sortCardDIs = (attributes: DataIdentifier[]) =>
  attributes.sort((a, b) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aKey = aParts[2] || '';
    const bKey = bParts[2] || '';

    const keyComparison = cardOrder[aKey] - cardOrder[bKey];
    if (keyComparison !== 0) {
      return keyComparison;
    }

    // If the third part is the same, compare based on the fourth part
    const aSubKey = aParts[3] || '';
    const bSubKey = bParts[3] || '';
    return aSubKey.localeCompare(bSubKey);
  });

const sortBankDIs = (attributes: DataIdentifier[]) =>
  attributes.sort((a, b) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aKey = aParts[2] || '';
    const bKey = bParts[2] || '';
    return bankOrder[aKey] - bankOrder[bKey];
  });

export const getCustomDIs = (data: EntityVault) => {
  const attributes = Object.keys(data);
  const filtered = attributes
    .filter(attr => attr.startsWith('custom') || attr.startsWith('document.custom'))
    .sort((a, b) => a.localeCompare(b));
  return filtered as DataIdentifier[];
};

export const getCardDis = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const filtered = filterCards(attributes, search);
  const sorted = sortCardDIs(filtered);
  return sorted;
};

export const getBankDis = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const filtered = filterBankAccounts(attributes, search);
  const sorted = sortBankDIs(filtered);
  return sorted;
};

export default getDI;
