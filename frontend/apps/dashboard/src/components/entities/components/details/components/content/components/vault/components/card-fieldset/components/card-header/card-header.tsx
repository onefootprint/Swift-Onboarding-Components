import { IcoCheck24, IcoChevronDown24 } from '@onefootprint/icons';
import { EntityCard } from '@onefootprint/types';
import { Dropdown, media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import CardIcon from '../card-icon';

export type CardHeaderProps = {
  cards: EntityCard[];
  selectedCard: EntityCard;
  onChange: (newCard: EntityCard) => void;
};

export const CardHeader = ({
  cards,
  selectedCard,
  onChange,
}: CardHeaderProps) => (
  <MiniCardDisplay>
    <CardIcon issuer={selectedCard?.issuer || ''} />
    <CardLine>
      <Typography variant="body-4">
        {selectedCard?.number_last4
          ? `••••${selectedCard.number_last4}`
          : `••••••••`}
      </Typography>
      <Typography variant="body-4">({selectedCard.alias})</Typography>
    </CardLine>
    <Dropdown.Root>
      <Dropdown.Trigger aria-label="Card header dropdown trigger">
        <IcoChevronDown24 />
      </Dropdown.Trigger>
      <Dropdown.Content align="end" sideOffset={4}>
        <CardDropdownDisplay>
          {cards.map(card => (
            <CardDropdownElement
              key={`${card?.number_last4}-${card.alias}`}
              onClick={() => onChange(card)}
            >
              <CardAndNumber>
                <CardIcon key={card.issuer || ''} issuer={card.issuer || ''} />
                <Typography variant="body-4">
                  {card?.number_last4 ? `••••${card.number_last4}` : `••••••••`}
                </Typography>
              </CardAndNumber>
              <AliasAndCheckmark>
                <Typography variant="body-4" color="tertiary">
                  {card.alias}
                </Typography>
                {card.alias === selectedCard.alias ? (
                  <IcoCheck24 />
                ) : (
                  <BlankIcon />
                )}
              </AliasAndCheckmark>
            </CardDropdownElement>
          ))}
        </CardDropdownDisplay>
      </Dropdown.Content>
    </Dropdown.Root>
  </MiniCardDisplay>
);

const MiniCardDisplay = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.spacing[3]};
    white-space: nowrap;

    ${media.lessThan('md')`
      display: none;
    `}
  `};
`;

const BlankIcon = styled.div`
  ${({ theme }) => css`
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
  `};
`;

const CardDropdownElement = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    cursor: pointer;
    flex-wrap: nowrap;
    overflow: hidden;
  `};
`;

const CardLine = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[4]};
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

const CardDropdownDisplay = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    user-select: none;
  `};
`;

export default CardHeader;
