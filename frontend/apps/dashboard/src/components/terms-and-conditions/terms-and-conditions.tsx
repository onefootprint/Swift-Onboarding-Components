import { LinkButton, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const TermsAndConditions = () => (
  <TextContainer>
    <Typography variant="caption-2" color="tertiary">
      By continuing you agree to our
    </Typography>
    <Link href="https://onefootprint.com/terms-of-service" passHref>
      <LinkButton size="xxTiny" target="_blank">
        Terms of Service
      </LinkButton>
    </Link>
    <Typography variant="caption-2" color="tertiary">
      and
    </Typography>
    <Link href="https://onefootprint.com/privacy-policy" passHref>
      <LinkButton size="xxTiny" target="_blank">
        Privacy Policy.
      </LinkButton>
    </Link>
  </TextContainer>
);

const TextContainer = styled.div`
  text-align: center;

  > * {
    display: inline;
    margin-right: ${({ theme }) => theme.spacing[2]};
  }
`;

export default TermsAndConditions;
