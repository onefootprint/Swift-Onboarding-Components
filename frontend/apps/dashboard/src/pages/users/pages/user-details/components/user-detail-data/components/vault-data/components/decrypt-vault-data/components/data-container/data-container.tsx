import { Icon } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DataContainerProps = {
  iconComponent: Icon;
  children: React.ReactNode;
  title: string;
  renderCta: () => React.ReactNode;
};

const DataContainer = ({
  iconComponent: IconComponent,
  title,
  children,
  renderCta,
}: DataContainerProps) => (
  <StyledContainer>
    <Header>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <IconComponent />
        <Typography variant="label-3">{title}</Typography>
      </Box>
      {renderCta()}
    </Header>
    <RowContainer>{children}</RowContainer>
  </StyledContainer>
);

const StyledContainer = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px;
    height: 100%;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px ${theme.spacing[2]}px 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `};
`;

const RowContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]}px;
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
  `};
`;

export default DataContainer;
