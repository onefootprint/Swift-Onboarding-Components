import { Icon } from 'icons';
import React from 'react';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import { UserData } from 'src/pages/users/hooks/use-user-data';
import styled, { css } from 'styled-components';
import { SXStyleProps, SXStyles, Typography, useSX } from 'ui';

export type DataRow = {
  title: string;
  data: UserData;
  shouldShow: boolean;
};

type DataContainerProps = {
  headerIcon: Icon;
  rows: DataRow[];
  sx?: SXStyleProps;
  title: string;
};

const DataContainer = ({
  headerIcon: HeaderIcon,
  title,
  rows,
  sx,
}: DataContainerProps) => {
  const sxStyles = useSX(sx);
  return (
    <StyledContainer sx={sxStyles}>
      <Header>
        <HeaderIcon />
        <Typography variant="label-3">{title}</Typography>
      </Header>
      <RowContainer>
        {rows
          .filter(row => row.shouldShow)
          .map((item: DataRow) => (
            <Row key={item.title}>
              <Typography variant="label-3" color="tertiary">
                {item.title}
              </Typography>
              <FieldOrPlaceholder data={item.data} />
            </Row>
          ))}
      </RowContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ sx: SXStyles }>`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]}px;
  `};
  ${({ sx }) => css`
    ${sx};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]}px;
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

const Row = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default DataContainer;
