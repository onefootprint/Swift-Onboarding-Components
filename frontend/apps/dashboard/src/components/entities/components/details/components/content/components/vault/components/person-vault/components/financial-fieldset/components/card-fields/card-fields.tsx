import type { DataIdentifier, Entity, EntityCard, VaultValue } from '@onefootprint/types';
import { Divider, Stack } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useState } from 'react';
import { getCardDis } from 'src/components/entities/utils/get-dis';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';
import getCards from '../../../../../../utils/get-cards';
import type { DiField } from '../../../../../../vault.types';
import Field from '../../../../../field';
import useGetCardIssuer from '../../utils/use-get-card-issuer';
import useGetTranslationWithoutAlias from '../../utils/use-get-translation-without-alias';
import CardSelector from './components/card-selector';

export type CardFieldsProps = {
  entity: Entity;
  setSelectedItemDis: (dis: DataIdentifier[]) => void;
};

const CardFields = ({ entity, setSelectedItemDis }: CardFieldsProps) => {
  const getTranslationsWithoutAlias = useGetTranslationWithoutAlias();
  const getCardIssuer = useGetCardIssuer();
  const cards: EntityCard[] = getCards(entity);
  const [selectedCard, setSelectedCard] = useState<EntityCard | undefined>(cards.length > 0 ? cards[0] : undefined);
  const dis = getCardDis(entity.attributes, selectedCard?.alias);
  const fields = dis.map(di => ({ di }));

  useEffect(() => {
    setSelectedItemDis(dis);
  }, [selectedCard]);

  const renderCardIssuer = (value: VaultValue) => {
    const changedValue = getCardIssuer(value);
    return <FieldOrPlaceholder data={changedValue} />;
  };

  const renderField = (field: DiField) => {
    const { di } = field;

    if (di.endsWith('issuer')) {
      return (
        <Field
          renderValue={renderCardIssuer}
          key={di}
          di={di}
          entity={entity}
          renderLabel={() => getTranslationsWithoutAlias(di)}
        />
      );
    }
    return <Field key={di} di={di} entity={entity} renderLabel={() => getTranslationsWithoutAlias(di)} />;
  };

  return (
    <Stack direction="column" gap={5} padding={5} flex={1}>
      {cards?.length > 1 && (
        <>
          <CardSelector cards={cards} selected={selectedCard} onChange={setSelectedCard} />
          <Divider />
        </>
      )}

      <Stack direction="column" gap={4}>
        {fields.map(field => renderField(field))}
      </Stack>
    </Stack>
  );
};

export default CardFields;
