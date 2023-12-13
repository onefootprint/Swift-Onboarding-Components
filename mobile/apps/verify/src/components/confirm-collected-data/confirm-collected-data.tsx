import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import Header from '../header';

type ConfirmCollectedDataProps = {
  title: string;
  subtitle: string;
  cta: string;
  onClickConfirm: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
};

const ConfirmCollectedData = ({
  title,
  subtitle,
  cta,
  onClickConfirm,
  isLoading,
  children,
}: ConfirmCollectedDataProps) => (
  <Box gap={7} display="flex" flexDirection="column">
    <Header title={title} subtitle={subtitle} />
    <SectionsContainer>{children}</SectionsContainer>
    <Button onPress={onClickConfirm} loading={isLoading}>
      {cta}
    </Button>
  </Box>
);

const SectionsContainer = styled.View`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default ConfirmCollectedData;
