import type { EntityCard } from '@onefootprint/types';
import { SelectCustom, Stack } from '@onefootprint/ui';
import CardIcon from '../card-icon';

export type CardSelectorProps = {
  selected?: EntityCard;
  onChange: (item: EntityCard) => void;
  cards: EntityCard[];
};

export const CardSelector = ({ selected, onChange, cards }: CardSelectorProps) => {
  const handleChange = (newValue: string) => {
    const newItem = cards.find(card => card.alias === newValue);
    if (newItem) {
      onChange(newItem);
    }
  };

  return (
    <SelectCustom.Root value={selected?.alias || ''} onValueChange={handleChange}>
      <SelectCustom.Input>
        {selected && (
          <Stack alignItems="center" gap={2}>
            {selected.issuer && <CardIcon issuer={selected.issuer} />}
            {`${selected.number_last4 ? `•••• ${selected.number_last4}` : '••••'} (${selected.alias || ''})`}
          </Stack>
        )}
      </SelectCustom.Input>
      <SelectCustom.Content width="100%">
        <SelectCustom.Group>
          {cards.map(card => (
            <SelectCustom.Item key={card.alias} value={card.alias || ''}>
              {card && (
                <Stack alignItems="center" gap={2}>
                  {card.issuer && <CardIcon issuer={card.issuer} />}
                  {`${card.number_last4 ? `•••• ${card.number_last4}` : '••••'} (${card.alias || ''})`}
                </Stack>
              )}
            </SelectCustom.Item>
          ))}
        </SelectCustom.Group>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default CardSelector;
