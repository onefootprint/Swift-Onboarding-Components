import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('ui', {
    keyPrefix: 'components.pagination',
  });

  if (hasNextPage || hasPrevPage) {
    return (
      <Stack justify="space-between" marginTop={5}>
        <Stack align="center">
          <Typography variant="body-3" color="secondary">
            {t('showing', {
              lowerBoundShownResults,
              upperBoundShownResults,
              totalNumResults,
            })}
          </Typography>
        </Stack>
        <ButtonContainer>
          <Button
            disabled={!hasPrevPage}
            onClick={onPrevPage}
            variant="secondary"
            size="small"
          >
            {t('previous')}
          </Button>
          <Button
            disabled={!hasNextPage}
            onClick={onNextPage}
            variant="secondary"
            size="small"
          >
            {t('next')}
          </Button>
        </ButtonContainer>
      </Stack>
    );
  }
  return null;
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
