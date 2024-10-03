import type { EntityCard } from '@onefootprint/types';
import { SelectCustom, Text, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import CardIcon from '../card-icon';

export type CardHeaderProps = {
  cards: EntityCard[];
  selectedCard: EntityCard;
  onChange: (newCard: EntityCard) => void;
};

export const CardHeader = ({ cards, selectedCard, onChange }: CardHeaderProps) => {
  const handleCardChange = (value: string) => {
    const newCard = cards.find(card => card.alias === value);
    if (newCard) {
      onChange(newCard);
    }
  };

  const sortedCards = cards
    .slice()
    .sort(({ alias = '' }, { alias: otherAlias = '' }) => (alias || '').localeCompare(otherAlias || ''));

  return (
    <CardHeaderContainer>
      <SelectCustom.Root value={selectedCard.alias || ''} onValueChange={handleCardChange}>
        <SelectCustom.Trigger aria-label="Open card options">
          <CardIcon issuer={selectedCard?.issuer || ''} />
          <CardLine>
            <SelectCustom.Value placeholder="Select card">
              <Text variant="body-3">{selectedCard?.number_last4 ? `••••${selectedCard.number_last4}` : '••••'}</Text>
              <Text variant="body-3">({selectedCard.alias})</Text>
            </SelectCustom.Value>
          </CardLine>
          <SelectCustom.ChevronIcon />
        </SelectCustom.Trigger>
        <SelectCustom.Content>
          <SelectCustom.Group>
            {sortedCards.map(card => (
              <SelectCustom.Item key={`${card?.number_last4}-${card.alias}`} value={card.alias || ''}>
                <CardIcon key={card.issuer} issuer={card.issuer || ''} />
                <Text variant="body-3">{card?.number_last4 ? `••••${card.number_last4}` : '••••'}</Text>
                <Text variant="body-3">({card.alias})</Text>
              </SelectCustom.Item>
            ))}
          </SelectCustom.Group>
        </SelectCustom.Content>
      </SelectCustom.Root>
    </CardHeaderContainer>
  );
};

const CardHeaderContainer = styled.div`
  ${media.lessThan('md')`
    display: none;
  `}
`;

const CardLine = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[4]};
    margin-left: ${theme.spacing[3]};
    white-space: nowrap;
  `};
`;

export default CardHeader;
