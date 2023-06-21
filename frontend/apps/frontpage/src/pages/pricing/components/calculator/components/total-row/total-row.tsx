import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';

type TotalRowProps = {
  children: React.ReactNode;
};

const TotalRow = ({ children }: TotalRowProps) => {
  const { t } = useTranslation('pages.pricing.calculator');

  return (
    <Container>
      <Title>
        <Typography variant="label-2">{t('rows.total')}</Typography>
        <Typography variant="label-4" color="tertiary">
          ({t('rows.per-month')})
        </Typography>
      </Title>
      <Value>
        <Typography variant="label-2">{children}</Typography>
      </Value>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[4]};
    width: 100%;
    border-top: 1px solid ${theme.borderColor.tertiary};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[5]} ${theme.spacing[8]};
    `}
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[2]};
  `}
`;

const Value = styled.div`
  width: 140px;
  text-align: center;
`;
export default TotalRow;
