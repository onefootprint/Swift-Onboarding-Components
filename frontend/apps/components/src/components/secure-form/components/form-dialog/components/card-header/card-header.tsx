import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
  `}
`;

export default CardHeader;
