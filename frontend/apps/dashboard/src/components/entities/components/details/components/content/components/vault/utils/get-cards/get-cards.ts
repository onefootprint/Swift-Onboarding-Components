import type { Entity, EntityCard } from '@onefootprint/types';

const getCards = (entity: Entity): EntityCard[] => {
  if (!Object.keys(entity.data).length) {
    return [];
  }
  const cards: Record<string, EntityCard> = {};
  entity.data.forEach(attribute => {
    if (attribute.identifier.startsWith('card')) {
      const [, alias, field] = attribute.identifier.split('.');
      if (alias && field) {
        cards[alias] = { ...cards[alias], [field]: attribute.value };
      }
    }
  });

  return Object.entries(cards)
    .filter(([alias, card]) => alias !== 'undefined' && Object.keys(card).length > 0)
    .sort(([aliasA], [aliasB]) => aliasA.localeCompare(aliasB))
    .map(([alias, card]) => ({ ...card, alias }));
};

export default getCards;
