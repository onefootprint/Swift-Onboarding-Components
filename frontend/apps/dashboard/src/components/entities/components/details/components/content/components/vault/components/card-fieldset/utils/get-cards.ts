import type { Entity, EntityCard } from '@onefootprint/types';
import merge from 'lodash/merge';
import set from 'lodash/set';

type CardsBuffer = {
  card?: Partial<Record<string, EntityCard>>;
};

const getCards = (entity: Entity) => {
  if (
    Object.keys(entity.decryptedAttributes).length === 0 &&
    Object.keys(entity.attributes).length === 0
  ) {
    return [];
  }

  const cardsEncryptedBuffer: CardsBuffer = entity.attributes.reduce(
    (acc, key) => {
      if (key.startsWith('card')) {
        set(acc, key, null);
      }
      return acc;
    },
    {},
  );

  const cardsDecryptedBuffer: CardsBuffer = Object.entries(
    entity.decryptedAttributes,
  ).reduce((acc, [key, value]) => {
    if (key.startsWith('card')) {
      set(acc, key, value);
    }
    return acc;
  }, {});

  if (!cardsDecryptedBuffer.card && !cardsEncryptedBuffer.card) {
    return [];
  }

  const cardsAggregatedBuffer = merge(
    cardsEncryptedBuffer,
    cardsDecryptedBuffer,
  );

  return Object.entries(cardsAggregatedBuffer.card ?? {}).map(
    ([alias, card]) => ({
      ...card,
      alias,
    }),
  ) as EntityCard[];
};

export default getCards;
