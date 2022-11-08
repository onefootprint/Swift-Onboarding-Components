import { Icon } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type DataSectionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  renderCta?: () => React.ReactNode;
  title: string;
};

const DataSection = ({
  children,
  iconComponent: IconComponent,
  renderCta,
  title,
}: DataSectionProps) => (
  <DataSectionContainer>
    <Header>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <IconComponent />
        <Typography variant="label-3">{title}</Typography>
      </Box>
      {renderCta?.()}
    </Header>
    <Fieldset>{children}</Fieldset>
  </DataSectionContainer>
);

const DataSectionContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: 100%;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `};
`;

export default DataSection;
