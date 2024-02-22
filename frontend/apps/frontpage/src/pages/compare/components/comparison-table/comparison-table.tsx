import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import options from '../../../../config/locales/en/common.json';

const tableOptions = options.pages.compare.table;

const ComparisonTable = () => (
  <TableContainer>
    <Header>
      <Row data-type="header">
        {Object.values(tableOptions.companies).map(header => (
          <Typography key={header} variant="body-2">
            {header}
          </Typography>
        ))}
      </Row>
    </Header>
    {Object.values(tableOptions.features).map(feature => (
      <div key={feature.title}>
        <Row>
          <Cell data-area="title">
            <Typography variant="body-2">{feature.title}</Typography>
          </Cell>
          <Cell data-area="footprint">
            {feature.footprint && <IcoCheck16 />}
          </Cell>
          <Cell data-area="alloy">{feature.alloy && <IcoCheck16 />}</Cell>
          <Cell data-area="vgs">{feature.vgs && <IcoCheck16 />}</Cell>
        </Row>
      </div>
    ))}
  </TableContainer>
);

const TableContainer = styled.table`
  ${({ theme }) => css`
    border-collapse: collapse;
    width: 100%;
    margin: ${theme.spacing[10]} 0;
  `}
`;

const Header = styled.thead`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    color: ${theme.color.primary};
    text-align: left;
    padding: ${theme.spacing[2]};
    text-align: center;
  `}
`;

const Row = styled.tr`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    grid-template-areas: 'title footprint alloy vgs';
    padding: ${theme.spacing[4]};
    border-bottom: 1px dashed ${theme.borderColor.tertiary};

    &[data-type='header'] {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      &::before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  `}
`;

const Cell = styled.td`
  display: flex;
  align-items: center;
  justify-content: center;

  &[data-area='title'] {
    grid-area: title;
    justify-content: left;
  }

  &[data-area='footprint'] {
    grid-area: footprint;
  }
  &[data-area='alloy'] {
    grid-area: alloy;
  }
  &[data-area='vgs'] {
    grid-area: vgs;
  }
`;
export default ComparisonTable;
