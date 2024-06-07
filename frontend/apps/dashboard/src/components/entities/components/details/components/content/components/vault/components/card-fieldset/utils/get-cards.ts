import type { Entity, EntityCard, VaultValue } from '@onefootprint/types';
import merge from 'lodash/merge';

type CardsBuffer = {
  card?: Partial<Record<string, EntityCard>>;
};

const getCards = (entity: Entity) => {
  if (Object.keys(entity.decryptedAttributes).length === 0 && Object.keys(entity.attributes).length === 0) {
    return [];
  }

  const cardsEncryptedBuffer: CardsBuffer = entity.attributes.reduce(
    (acc, key) => {
      if (key.startsWith('card')) {
        const [, cardAlias, cardField] = key.split('.');
        if (cardAlias in acc) {
          acc[cardAlias][cardField as string] = null;
        } else {
          acc[cardAlias] = { [cardField]: null };
        }
      }
      return acc;
    },
    {} as Record<string, Record<string, VaultValue>>,
  );

  const cardsDecryptedBuffer: CardsBuffer = Object.entries(entity.decryptedAttributes).reduce(
    (acc, [key, value]) => {
      if (key.startsWith('card')) {
        const [, cardAlias, cardField] = key.split('.');
        if (cardAlias in acc) {
          acc[cardAlias][cardField as string] = value as VaultValue;
        } else {
          acc[cardAlias] = { [cardField]: value as VaultValue };
        }
      }
      return acc;
    },
    {} as Record<string, Record<string, VaultValue>>,
  );

  if (!cardsDecryptedBuffer && !cardsEncryptedBuffer) {
    return [];
  }

  const cardsAggregatedBuffer = merge(cardsEncryptedBuffer, cardsDecryptedBuffer);

  return Object.entries(cardsAggregatedBuffer ?? {}).map(([alias, card]) => ({
    ...card,
    alias,
  })) as EntityCard[];
};

export default getCards;
