import { Icon } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, SXStyleProps, SXStyles, Typography, useSX } from 'ui';

type DataContainerProps = {
  iconComponent: Icon;
  children: React.ReactNode;
  sx?: SXStyleProps;
  title: string;
  renderCta: () => React.ReactNode;
};

const DataContainer = ({
  iconComponent: IconComponent,
  title,
  children,
  sx,
  renderCta,
}: DataContainerProps) => {
  const sxStyles = useSX(sx);
  return (
    <StyledContainer sx={sxStyles}>
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
};

const StyledContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme, sx }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px;
    ${sx};
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
