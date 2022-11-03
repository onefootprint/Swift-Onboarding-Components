import { Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DataSectionProps = {
  children: React.ReactNode;
  iconComponent: Icon;
  // renderFooter: () => React.ReactNode;
  title: string;
};

const DataSection = ({
  iconComponent: IconComponent,
  title,
  children,
}: // renderFooter,
DataSectionProps) => (
  <DataSectionContainer>
    <Header>
      <IconComponent />
      <Typography variant="label-3">{title}</Typography>
    </Header>
    <Inner>
      <Fieldset>{children}</Fieldset>
      {/* <Footer>{renderFooter()}</Footer> */}
    </Inner>
  </DataSectionContainer>
);

const DataSectionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]};
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]} ${theme.spacing[4]};
  `};
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

// const Footer = styled.footer`
//   ${({ theme }) => css`
//     display: flex;
//     padding-top: ${theme.spacing[4]};
//     margin-top: ${theme.spacing[7]};
//     border-top: 1px solid ${theme.borderColor.tertiary};
//   `};
// `;

export default DataSection;
