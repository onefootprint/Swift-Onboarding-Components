import type { DataIdentifier, EntityVault } from '@onefootprint/types';

const order: Record<string, number> = {
  issuer: 1,
  name: 2,
  number: 3,
  expiration: 4,
  cvc: 5,
  billing_address: 6,
};

const filter = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const hiddenAttributes = ['expiration_month', 'expiration_year', 'number_last4'];
  return attributes.filter(
    attr => attr.includes(`card.${search}`) && !hiddenAttributes.some(hiddenAttr => attr.includes(hiddenAttr)),
  );
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
    const aKey = a.split('.')[2];
    const bKey = b.split('.')[2];

    return order[aKey] - order[bKey];
  });

export const getCustomDIs = (data: EntityVault) => {
  const attributes = Object.keys(data);
  const filtered = attributes.filter(attr => attr.startsWith('custom') || attr.startsWith('document.custom'));
  return filtered as DataIdentifier[];
};

const getDis = (attributes: DataIdentifier[], search: string | null | undefined) => {
  const filtered = filter(attributes, search);
  const sorted = sort(filtered);
  return sorted;
};

export default getDis;
