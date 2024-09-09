import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Container, createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useEffect, useRef, useState } from 'react';
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

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [isOverflowingLeft, setIsOverflowingLeft] = useState(false);
  const [isOverflowingRight, setIsOverflowingRight] = useState(false);

  const handleScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      setIsOverflowingLeft(scrollLeft > 0);
      setIsOverflowingRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  return (
    <Container marginTop={5}>
      <TableWrapper
        ref={tableWrapperRef}
        onScroll={handleScroll}
        $isOverflowingLeft={isOverflowingLeft}
        $isOverflowingRight={isOverflowingRight}
      >
        <TableContent>
          <thead>
            <Header>
              <HeaderItem />
              <HeaderItem>Footprint</HeaderItem>
              <HeaderItem>Alloy</HeaderItem>
              <HeaderItem>Persona</HeaderItem>
              <HeaderItem>Plaid</HeaderItem>
              <HeaderItem>Onfido</HeaderItem>
            </Header>
          </thead>
          <tbody>
            {compareTableContent.map((row, index) => (
              <Row key={row.featureId} $isLast={index === compareTableContent.length - 1}>
                <RowItem>{t(`table.${row.featureId}` as ParseKeys<'common'>)}</RowItem>
                <RowItem>{getIcon(row.footprint)}</RowItem>
                <RowItem>{row.alloy && getIcon(row.alloy)}</RowItem>
                <RowItem>{row.persona && getIcon(row.persona)}</RowItem>
                <RowItem>{row.plaid && getIcon(row.plaid)}</RowItem>
                <RowItem>{row.onfido && getIcon(row.onfido)}</RowItem>
              </Row>
            ))}
          </tbody>
        </TableContent>
      </TableWrapper>
    </Container>
  );
};

const TableWrapper = styled.div<{
  $isOverflowingLeft: boolean;
  $isOverflowingRight: boolean;
}>`
  ${({ theme, $isOverflowingLeft, $isOverflowingRight }) => css`
    overflow-x: auto;
    white-space: nowrap;
    position: relative;
    border-right: ${$isOverflowingRight ? theme.borderWidth[1] : 0} solid ${theme.borderColor.tertiary};
    border-left: ${$isOverflowingLeft ? theme.borderWidth[1] : 0} solid ${theme.borderColor.tertiary};
    transition: border-right 0.1s ease-in-out, border-left 0.1s ease-in-out;
  `}
`;

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
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    height: ${HEADER_HEIGHT}px;
    line-height: ${HEADER_HEIGHT}px;
    width: 80px;
    white-space: nowrap;
    padding: 0 ${theme.spacing[5]};
  `}
`;

const Row = styled.tr<{ $isLast?: boolean }>`
  ${({ theme, $isLast }) => css`
    height: ${ROW_HEIGHT}px;
    ${!$isLast && `border-bottom: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};`}
  `}
`;

const RowItem = styled.td`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    line-height: ${ROW_HEIGHT}px;
    position: relative;
    text-align: left;
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
