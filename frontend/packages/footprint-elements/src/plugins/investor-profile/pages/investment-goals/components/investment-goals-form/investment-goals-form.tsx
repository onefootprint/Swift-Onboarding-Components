import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type InvestmentGoalsFormProps = {
  isLoading?: boolean;
  ctaLabel?: string;
};

const InvestmentGoalsForm = ({
  isLoading,
  ctaLabel,
}: InvestmentGoalsFormProps) => {
  const { allT } = useTranslation('pages.investment-goals.form');
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

export default InvestmentGoalsForm;
