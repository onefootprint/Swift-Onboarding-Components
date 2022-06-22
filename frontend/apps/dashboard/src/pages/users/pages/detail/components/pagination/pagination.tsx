import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Typography } from 'ui';

type PaginationProps = {
  totalNumResults: number;
  pageSize: number;
  pageIndex: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

const Pagination = ({
  totalNumResults,
  pageSize,
  pageIndex,
  onPrevPage,
  onNextPage,
  hasPrevPage,
  hasNextPage,
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
          <Typography variant="label-3">
            Showing {lowerBoundShownResults} to {upperBoundShownResults} of{' '}
            {totalNumResults} results
          </Typography>
        ) : (
          <Typography variant="label-3">No results</Typography>
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
