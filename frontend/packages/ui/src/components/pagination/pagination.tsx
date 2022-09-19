import React from 'react';
import styled, { css } from 'styled-components';

import Box from '../box';
import Button from '../button';
import Typography from '../typography';

export type PaginationProps = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  pageIndex: number;
  pageSize: number;
  totalNumResults: number;
};

const Pagination = ({
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  pageIndex,
  pageSize,
  totalNumResults,
}: PaginationProps) => {
  const lowerBoundShownResults = pageIndex * pageSize + 1;
  const upperBoundShownResults = Math.min(
    (pageIndex + 1) * pageSize,
    totalNumResults,
  );
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {totalNumResults ? (
          <Typography variant="body-3" color="secondary">
            Showing {lowerBoundShownResults} to {upperBoundShownResults} of{' '}
            {totalNumResults} results
          </Typography>
        ) : (
          <Typography variant="body-3" color="secondary">
            No results
          </Typography>
        )}
      </Box>
      <ButtonContainer>
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
      </ButtonContainer>
    </Box>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px;
  `};
`;

export default Pagination;
