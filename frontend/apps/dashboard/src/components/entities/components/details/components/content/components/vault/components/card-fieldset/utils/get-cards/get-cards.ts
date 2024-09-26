import type { Entity, EntityCard } from '@onefootprint/types';

const getCards = (entity: Entity): EntityCard[] => {
  if (!entity.attributes.length && !Object.keys(entity.decryptedAttributes).length) {
    return [];
  }
  const cards: Record<string, EntityCard> = {};
  entity.attributes.forEach(key => {
    if (key.startsWith('card')) {
      const [, alias, field] = key.split('.');
      cards[alias] = { ...cards[alias], [field]: null };
    }
  });
  Object.entries(entity.decryptedAttributes).forEach(([key, value]) => {
    if (key.startsWith('card')) {
      const [, alias, field] = key.split('.');
      cards[alias] = { ...cards[alias], [field]: value };
    }
  });
  return Object.entries(cards).map(([alias, card]) => ({ ...card, alias }));
};

export default getCards;
