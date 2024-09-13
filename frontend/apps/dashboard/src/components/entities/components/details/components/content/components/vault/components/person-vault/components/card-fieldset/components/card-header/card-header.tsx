import type { EntityCard } from '@onefootprint/types';
import { Dropdown, Text, media } from '@onefootprint/ui';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import CardIcon from '../card-icon';

export type CardHeaderProps = {
  cards: EntityCard[];
  selectedCard: EntityCard;
  onChange: (newCard: EntityCard) => void;
};

export const CardHeader = ({ cards, selectedCard, onChange }: CardHeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCardChange = (card: EntityCard) => {
    onChange(card);
    setShowDropdown(false);
  };

  const sortedCards = cards
    .slice()
    .sort(({ alias = '' }, { alias: otherAlias = '' }) => (alias || '').localeCompare(otherAlias || ''));

  return (
    <CardHeaderContainer>
      <Dropdown.Root open={showDropdown} onOpenChange={handleToggleDropdown}>
        <Dropdown.Trigger aria-label="Open card options" variant="chevron">
          <CardIcon issuer={selectedCard?.issuer || ''} />
          <CardLine>
            <Text variant="body-3">{selectedCard?.number_last4 ? `••••${selectedCard.number_last4}` : '••••'}</Text>
            <Text variant="body-3">({selectedCard.alias})</Text>
          </CardLine>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" width="240px">
            <Dropdown.RadioGroup value={selectedCard.alias || ''}>
              {sortedCards.map(card => (
                <Dropdown.RadioItem
                  key={`${card?.number_last4}-${card.alias}`}
                  value={card.alias || ''}
                  onSelect={() => handleCardChange(card)}
                >
                  <CardIcon key={card.issuer} issuer={card.issuer || ''} />
                  <Text variant="body-3">{card?.number_last4 ? `••••${card.number_last4}` : '••••'}</Text>
                  <Text variant="body-3">({card.alias})</Text>
                </Dropdown.RadioItem>
              ))}
            </Dropdown.RadioGroup>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
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
