import { createFontStyles, media } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type TableProps = {
  children: React.ReactNode;
};

const Table = ({ children }: TableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowRight, setOverflowRight] = useState(false);
  const [overflowLeft, setOverflowLeft] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const {
          scrollWidth: containerScrollWidth,
          clientWidth: containerClientWidth,
          scrollLeft,
        } = containerRef.current;
        const scrollRight = containerScrollWidth - containerClientWidth - scrollLeft;

        setOverflowRight(scrollRight > 0);
        setOverflowLeft(scrollLeft > 0);
      }
    };

    const currentContainer = containerRef.current;
    currentContainer?.addEventListener('scroll', handleScroll);

    return () => currentContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Container data-overflow-right={overflowRight} data-overflow-left={overflowLeft}>
      <TableWrapper ref={containerRef}>
        <Content ref={tableRef}>{children}</Content>
      </TableWrapper>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    margin-bottom: ${theme.spacing[9]};
    
    &[data-overflow-right='true'] {
      &::after {
        content: '';
        position: absolute;
        z-index: ${theme.zIndex.sticky};
        top: 0;
        right: 0;
        bottom: 0;
        width: ${theme.spacing[4]};
        box-shadow: inset -${theme.spacing[4]} 0 ${theme.spacing[4]} -${theme.spacing[4]} ${theme.backgroundColor.senary};
        transition: box-shadow 0.3s ease;
        );
        
      }
    }

    &[data-overflow-left='true'] {
      &::before {
        content: '';
        position: absolute;
        z-index: ${theme.zIndex.sticky};
        top: 0;
        left: 0;
        bottom: 0;
        width: ${theme.spacing[4]};
        box-shadow: inset ${theme.spacing[4]} 0 ${theme.spacing[4]} -${theme.spacing[4]} ${theme.backgroundColor.senary};
        transition: box-shadow 0.3s ease;
      }
    }
  `}
`;

const TableWrapper = styled.div`
  ${({ theme }) => css`
    overflow-x: auto;
    width: 100%;
    position: relative;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const Content = styled.table`
  ${({ theme }) => css`
    border-collapse: separate;
    border-radius: ${theme.borderRadius.default};
    width: 100%;
    display: table;
    z-index: -1;

    tr:not(:last-child) td {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    }

    th,
    td {
      padding: ${theme.spacing[5]} ${theme.spacing[6]};
      vertical-align: middle;
      width: auto;
    }

    ${media.greaterThan('md')`
      code {
        white-space: nowrap;
      }
    `}

    th {
      ${createFontStyles('caption-1')};
      white-space: nowrap;
      background: ${theme.backgroundColor.secondary};
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default}
        0 0;
      color: ${theme.color.primary};
      text-align: left;
      text-transform: uppercase;
    }

    tbody {
      ${createFontStyles('body-3')};
    }
  `};
`;

export default Table;
