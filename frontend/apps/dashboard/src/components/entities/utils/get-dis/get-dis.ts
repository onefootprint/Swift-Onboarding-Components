import type { DataIdentifier, EntityVault } from '@onefootprint/types';

const order: Record<string, number> = {
  issuer: 1,
  name: 2,
  number: 3,
  expiration: 4,
  cvc: 5,
  billing_address: 6,
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

const sort = (attributes: DataIdentifier[]) =>
  attributes.sort((a, b) => {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aKey = aParts[2] || '';
    const bKey = bParts[2] || '';

    const keyComparison = order[aKey] - order[bKey];
    if (keyComparison !== 0) {
      return keyComparison;
    }

    // If the third part is the same, compare based on the fourth part
    const aSubKey = aParts[3] || '';
    const bSubKey = bParts[3] || '';
    return aSubKey.localeCompare(bSubKey);
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
  const sorted = sort(filtered);
  return sorted;
};

export const getBankDis = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const filtered = filterBankAccounts(attributes, search);
  const sorted = sort(filtered);
  return sorted;
};

export default getDI;
