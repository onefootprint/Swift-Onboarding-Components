import { Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DataSectionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  renderFooter: () => React.ReactNode;
  title: string;
};

const DataSection = ({
  iconComponent: IconComponent,
  title,
  children,
  renderFooter,
}: DataSectionProps) => (
  <DataSectionContainer>
    <Header>
      <IconComponent />
      <Typography variant="label-3">{title}</Typography>
    </Header>
    <Inner>
      <Fieldset>{children}</Fieldset>
      <Footer>{renderFooter()}</Footer>
    </Inner>
  </DataSectionContainer>
);

const DataSectionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px ${theme.spacing[2]}px 0 0;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `};
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px ${theme.spacing[4]}px;
  `};
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]}px;
  `};
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    padding-top: ${theme.spacing[4]}px;
    margin-top: ${theme.spacing[7]}px;
    border-top: 1px solid ${theme.borderColor.tertiary};
  `};
`;

export default DataSection;
