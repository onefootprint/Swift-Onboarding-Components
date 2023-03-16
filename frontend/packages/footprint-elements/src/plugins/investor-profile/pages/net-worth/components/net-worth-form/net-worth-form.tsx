import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type NetWorthFormProps = {
  isLoading?: boolean;
  ctaLabel?: string;
};

const NetWorthForm = ({ isLoading, ctaLabel }: NetWorthFormProps) => {
  const { allT } = useTranslation('pages.net-worth.form');
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

export default NetWorthForm;
