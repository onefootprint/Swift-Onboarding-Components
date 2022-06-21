import React from 'react';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

type PaginationProps = {
  onPrevPage: () => void;
  onNextPage: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

const Pagination = ({
  onPrevPage,
  onNextPage,
  hasPrevPage,
  hasNextPage,
}: PaginationProps) => (
  <PaginationContainer>
    <Button
      disabled={!hasPrevPage}
      onClick={onPrevPage}
      variant="secondary"
      size="small"
    >
      Previous
    </Button>
    <Button
      disabled={!hasNextPage}
      onClick={onNextPage}
      variant="secondary"
      size="small"
    >
      Next
    </Button>
  </PaginationContainer>
);

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]}px;
    gap: ${theme.spacing[4]}px;
  `};
`;

export default Pagination;
