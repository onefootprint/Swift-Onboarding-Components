import styled, { css } from '@onefootprint/styled';
import React from 'react';

import Button from '../button';
import Stack from '../stack';
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
    <Stack justify="space-between" marginTop={5}>
      <Stack align="center">
        {totalNumResults ? (
          <Typography variant="body-3" color="secondary">
            Showing {lowerBoundShownResults} to {upperBoundShownResults} of{' '}
            {totalNumResults} total results
          </Typography>
        ) : (
          <Typography variant="body-3" color="secondary">
            No results
          </Typography>
        )}
      </Stack>
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
    </Stack>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]};
  `};
`;

export default Pagination;
