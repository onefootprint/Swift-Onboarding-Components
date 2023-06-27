import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type CardHeaderProps = {
  title: string;
};

const CardHeader = ({ title }: CardHeaderProps) => (
  <Header>{title && <Typography variant="label-1">{title}</Typography>}</Header>
);

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding: ${theme.spacing[7]} ${theme.spacing[7]} 0;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
  `}
`;

export default CardHeader;
