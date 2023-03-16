import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type IncomeFormProps = {
  isLoading?: boolean;
  ctaLabel?: string;
};

const IncomeForm = ({ isLoading, ctaLabel }: IncomeFormProps) => {
  const { allT } = useTranslation('pages.income.form');
  return (
    <Form>
      {/* TODO: */}
      <Button type="submit" fullWidth loading={isLoading}>
        {ctaLabel ?? allT('pages.cta-continue')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default IncomeForm;
