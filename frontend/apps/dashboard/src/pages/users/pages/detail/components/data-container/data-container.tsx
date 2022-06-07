import { Icon } from 'icons';
import React from 'react';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';
import useSX, { SXStyleProps, SXStyles } from 'ui/src/hooks/use-sx';

export type DataRow = {
  title: string;
  value?: string;
};

type DataContainerProps = {
  HeaderIcon: Icon;
  header: string;
  rows: DataRow[];
  sx?: SXStyleProps;
};

const DataContainer = ({
  HeaderIcon,
  header,
  rows,
  sx,
}: DataContainerProps) => {
  const sxStyles = useSX(sx);
  return (
    <StyledContainer sx={sxStyles}>
      <Header>
        <HeaderIcon />
        <Typography variant="label-3" sx={{ userSelect: 'none' }}>
          {header}
        </Typography>
      </Header>
      <RowContainer>
        {rows.map((item: DataRow) => (
          <Row>
            <Typography
              variant="label-3"
              color="tertiary"
              sx={{ userSelect: 'none' }}
            >
              {item.title}
            </Typography>
            <FieldOrPlaceholder value={item.value} />
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

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => css`
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
    gap: ${theme.spacing[2]}px;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `};
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
    gap: ${theme.spacing[4]}px;
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default DataContainer;
