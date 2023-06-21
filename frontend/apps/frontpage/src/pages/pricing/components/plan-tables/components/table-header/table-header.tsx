import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import Chip from '../chip';

type TableHeaderTypes = {
  title: string;
  subtitle?: string;
  microtitle: string;
};

const TableHeader = ({ title, subtitle, microtitle }: TableHeaderTypes) => (
  <Header>
    <Chip>{microtitle}</Chip>
    <TextContainer>
      <Typography variant="heading-3" as="h2">
        {title}
      </Typography>
      <Typography variant="body-2" as="p" sx={{ maxWidth: '320px' }}>
        {subtitle}
      </Typography>
    </TextContainer>
  </Header>
);

const Header = styled.div`
  ${({ theme }) => css`
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[2]};
  `}
`;

export default TableHeader;
