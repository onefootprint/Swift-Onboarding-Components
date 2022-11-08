import { Icon } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type DataSectionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  renderCta?: () => React.ReactNode;
  footer?: React.ReactNode;
  title: string;
};

const DataSection = ({
  children,
  iconComponent: IconComponent,
  renderCta,
  footer,
  title,
}: DataSectionProps) => (
  <DataSectionContainer>
    <Box>
      <Header>
        <Title>
          <IconComponent />
          <Typography variant="label-3">{title}</Typography>
        </Title>
        {renderCta?.()}
      </Header>
      <Fieldset>{children}</Fieldset>
    </Box>
    {footer && <Footer>{footer}</Footer>}
  </DataSectionContainer>
);

const DataSectionContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
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

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
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

const Footer = styled.footer`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} 0;
    margin: 0 ${theme.spacing[7]};
  `};
`;

export default DataSection;
