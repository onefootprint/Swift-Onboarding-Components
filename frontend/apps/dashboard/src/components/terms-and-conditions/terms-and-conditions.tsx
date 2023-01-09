import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

const TermsAndConditions = () => {
  const { t } = useTranslation('components.terms-and-conditions');
  return (
    <TextContainer>
      <Typography variant="caption-2" color="tertiary">
        {t('by-continuing')}
      </Typography>
      <Link href="https://onefootprint.com/terms-of-service" passHref>
        <LinkButton size="xxTiny" target="_blank">
          {t('terms-of-service')}
        </LinkButton>
      </Link>
      <Typography variant="caption-2" color="tertiary">
        {t('and')}
      </Typography>
      <Link href="https://onefootprint.com/privacy-policy" passHref>
        <LinkButton size="xxTiny" target="_blank">
          {t('privacy-policy')}
        </LinkButton>
      </Link>
    </TextContainer>
  );
};

const TextContainer = styled.div`
  ${({ theme }) => css`
    text-align: center;

    > * {
      display: inline;
      margin-right: ${theme.spacing[2]};
    }
  `}
`;

export default TermsAndConditions;
