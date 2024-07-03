import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Container, createFontStyles } from '@onefootprint/ui';
import { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import compareTableContent from './compare-table-content';

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 40;

const Table = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.compare' });
  const getIcon = (isChecked: boolean) => {
    return isChecked ? <IcoCheckSmall16 /> : '';
  };
  return (
    <Container>
      <TableContent>
        <thead>
          <Header>
            <HeaderItem></HeaderItem>
            <HeaderItem>Footprint</HeaderItem>
            <HeaderItem>Alloy</HeaderItem>
            <HeaderItem>Plaid</HeaderItem>
            <HeaderItem>Onfido</HeaderItem>
          </Header>
        </thead>
        <tbody>
          {compareTableContent.map((row, index) => (
            <Row key={row.featureId} $isLast={index === compareTableContent.length - 1}>
              <RowItem $isFirst>{t(`table.${row.featureId}` as ParseKeys<'common'>)}</RowItem>
              <RowItem>{getIcon(row.footprint)}</RowItem>
              <RowItem>{getIcon(row.alloy)}</RowItem>
              <RowItem>{getIcon(row.plaid)}</RowItem>
              <RowItem>{getIcon(row.onfido)}</RowItem>
            </Row>
          ))}
        </tbody>
      </TableContent>
    </Container>
  );
};

const TableContent = styled.table`
${({ theme }) => css`
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
    border-radius: ${theme.borderRadius.default};
    padding-top: ${theme.spacing[11]};
    padding-bottom: ${theme.spacing[11]};
    overflow: hidden;
  `}
`;

const Header = styled.tr`
  ${({ theme }) => css`
    height: ${HEADER_HEIGHT}px;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const HeaderItem = styled.th`
  ${createFontStyles('label-4')}
    height: ${HEADER_HEIGHT}px;
    line-height: ${HEADER_HEIGHT}px;
    width: 80px;
    white-space: nowrap;
`;

const Row = styled.tr<{ $isLast?: boolean }>`
  ${({ theme, $isLast }) => css`
    height: ${ROW_HEIGHT}px;
    ${!$isLast && `border-bottom: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};`}
  `}
`;
const RowItem = styled.td<{ $isFirst?: boolean }>`
  ${({ theme, $isFirst }) => css`
    ${createFontStyles('body-4')}
    line-height: ${ROW_HEIGHT}px;
    position: relative;
    text-align: ${$isFirst ? 'left' : 'center'};
    vertical-align: middle;
    padding: 0 ${theme.spacing[5]};
    white-space: nowrap;

    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `}
`;

export default Table;
