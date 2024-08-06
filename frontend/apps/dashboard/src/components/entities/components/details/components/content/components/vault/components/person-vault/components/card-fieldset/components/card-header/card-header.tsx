import { IcoCheck24, IcoChevronDown24 } from '@onefootprint/icons';
import type { EntityCard } from '@onefootprint/types';
import { Dropdown, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const changeCard = (card: EntityCard) => {
    onChange(card);
    setShowDropdown(false);
  };

  const sortedCards = cards
    .slice()
    .sort(({ alias = '' }, { alias: otherAlias = '' }) => (alias || '').localeCompare(otherAlias || ''));

  return (
    <CardHeaderContainer>
      <Dropdown.Root open={showDropdown} onOpenChange={toggleDropdown}>
        <CustomDropdownTrigger aria-label="Open card options">
          <CardIcon issuer={selectedCard?.issuer || ''} />
          <CardLine>
            <Text variant="body-4">{selectedCard?.number_last4 ? `••••${selectedCard.number_last4}` : `••••`}</Text>
            <Text variant="body-4">({selectedCard.alias})</Text>
          </CardLine>
          <IcoChevronDown24 className="dropdown-trigger-icon" />
        </CustomDropdownTrigger>
        <Dropdown.Content align="end" sideOffset={4} asChild>
          <Content>
            {sortedCards.map(card => (
              <CardDropdownElement key={`${card?.number_last4}-${card.alias}`} onClick={() => changeCard(card)}>
                <CardAndNumber>
                  <CardIcon key={card.issuer || ''} issuer={card.issuer || ''} />
                  <Text variant="body-4">{card?.number_last4 ? `••••${card.number_last4}` : `••••`}</Text>
                </CardAndNumber>
                <AliasAndCheckmark>
                  {card.alias}
                  {card.alias === selectedCard.alias ? <IcoCheck24 /> : <BlankIcon />}
                </AliasAndCheckmark>
              </CardDropdownElement>
            ))}
          </Content>
        </Dropdown.Content>
      </Dropdown.Root>
    </CardHeaderContainer>
  );
};

const Content = styled(Stack)`
  ${({ theme }) => css`
    max-height: 30vh;
    overflow-y: auto;
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[2]};
    display: flex;
    flex-direction: column;
  `};
`;

const CardHeaderContainer = styled.div`
  ${media.lessThan('md')`
    display: none;
  `}
`;

const CustomDropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} 0 ${theme.spacing[3]} ${theme.spacing[3]};
    width: unset;
    border-radius: ${theme.borderRadius.default};

    .dropdown-trigger-icon {
      transition: transform 0.2s ease-in-out;
    }

    &[data-state='open'] {
      background: unset;

      .dropdown-trigger-icon {
        transform: rotate(180deg);
      }
    }
  `};
`;

const BlankIcon = styled.div`
  ${({ theme }) => css`
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
  `};
`;

const CardDropdownElement = styled(Dropdown.Item)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[5]};
    cursor: pointer;
    flex-wrap: nowrap;
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
    min-height: 40px;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `};
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

const CardAndNumber = styled.div`
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

const AliasAndCheckmark = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    align-items: center;
    gap: ${theme.spacing[2]};
  `};
`;

export default CardHeader;
