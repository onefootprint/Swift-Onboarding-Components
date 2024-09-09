import type { EntityCard } from '@onefootprint/types';
import { Dropdown, Stack, Text, media } from '@onefootprint/ui';
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
        <Dropdown.Content align="end" $width="240px">
          <Dropdown.Group>
            {sortedCards.map(card => (
              <CardAndNumber
                key={`${card?.number_last4}-${card.alias}`}
                onClick={() => handleCardChange(card)}
                checked={card.alias === selectedCard.alias}
              >
                <Stack direction="row" align="center" justify="between" gap={4}>
                  <CardIcon key={card.issuer || ''} issuer={card.issuer || ''} />
                  <Text variant="body-3">{card?.number_last4 ? `••••${card.number_last4}` : '••••'}</Text>
                  <Text variant="body-3">({card.alias})</Text>
                </Stack>
              </CardAndNumber>
            ))}
          </Dropdown.Group>
        </Dropdown.Content>
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

const CardAndNumber = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[3]};
    flex-wrap: nowrap;
    overflow: hidden;
    width: 100%;
  `};
`;

export default CardHeader;
