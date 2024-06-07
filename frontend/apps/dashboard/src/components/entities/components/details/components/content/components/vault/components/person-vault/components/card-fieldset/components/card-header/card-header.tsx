import { IcoCheck24, IcoChevronDown24 } from '@onefootprint/icons';
import type { EntityCard } from '@onefootprint/types';
import { Dropdown, Text, media } from '@onefootprint/ui';
import React, { useState } from 'react';
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

  return (
    <CardHeaderContainer>
      <Dropdown.Root open={showDropdown} onOpenChange={toggleDropdown}>
        <CustomDropdownTrigger aria-label="Open card options">
          <CardIcon issuer={selectedCard?.issuer || ''} />
          <CardLine>
            <Text variant="body-4">{selectedCard?.number_last4 ? `••••${selectedCard.number_last4}` : `••••`}</Text>
            <Text variant="body-4">({selectedCard.alias})</Text>
          </CardLine>
          <IcoChevronDown24 />
        </CustomDropdownTrigger>
        <Dropdown.Content
          align="end"
          sideOffset={4}
          style={{
            padding: '0',
          }}
        >
          <DropdownInner>
            {cards.map(card => (
              <CardDropdownElement key={`${card?.number_last4}-${card.alias}`} onClick={() => changeCard(card)}>
                <CardAndNumber>
                  <CardIcon key={card.issuer || ''} issuer={card.issuer || ''} />
                  <Text variant="body-4">{card?.number_last4 ? `••••${card.number_last4}` : `••••`}</Text>
                </CardAndNumber>
                <AliasAndCheckmark>
                  <Text variant="body-4" color="tertiary">
                    {card.alias}
                  </Text>
                  {card.alias === selectedCard.alias ? <IcoCheck24 /> : <BlankIcon />}
                </AliasAndCheckmark>
              </CardDropdownElement>
            ))}
          </DropdownInner>
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

const CustomDropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[3]};
    width: unset;

    &[data-state='open'] {
      background: unset;
    }
  `};
`;

const BlankIcon = styled.div`
  ${({ theme }) => css`
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
  `};
`;

const DropdownInner = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[3]} 0px;
    user-select: none;
    width: 280px;
    border-radius: ${theme.borderRadius.default};
  `};
`;

const CardDropdownElement = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    cursor: pointer;
    flex-wrap: nowrap;
    overflow: hidden;
    :hover {
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
  `};
`;

const AliasAndCheckmark = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

export default CardHeader;
