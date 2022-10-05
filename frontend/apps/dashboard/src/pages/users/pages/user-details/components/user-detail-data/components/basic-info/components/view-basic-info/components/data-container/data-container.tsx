import { Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { UserData } from 'src/pages/users/hooks/use-user-data';
import styled, { css } from 'styled-components';

export type DataRow = {
  title: string;
  data: UserData;
  shouldShow: boolean;
};

type DataContainerProps = {
  headerIcon: Icon;
  children: React.ReactNode;
  title: string;
};

const DataContainer = ({
  headerIcon: HeaderIcon,
  title,
  children,
}: DataContainerProps) => (
  <StyledContainer>
    <Header>
      <HeaderIcon />
      <Typography variant="label-3">{title}</Typography>
    </Header>
    <RowContainer>{children}</RowContainer>
  </StyledContainer>
);

const StyledContainer = styled.div`
  ${({ theme }) => css`
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

const RowContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]}px;
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
  `};
`;

export default DataContainer;
