import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type SupportListItemProps = {
  IconComponent: Icon;
  onClick: () => void;
  label: string;
};

const SupportListItem = ({
  label,
  IconComponent,
  onClick,
}: SupportListItemProps) => (
  <Item onClick={onClick}>
    <IconComponent color="tertiary" />
    <Typography variant="label-3" color="tertiary">
      {label}
    </Typography>
  </Item>
);

const Item = styled.button`
  ${({ theme }) => css`
    background: none;
    border: 0;
    cursor: pointer;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
    padding: 0;

    @media (hover: hover) {
      &:hover {
        > * {
          color: ${theme.color.secondary};
        }

        path {
          fill: ${theme.color.secondary};
        }
      }
    }
  `}
`;

export default SupportListItem;
