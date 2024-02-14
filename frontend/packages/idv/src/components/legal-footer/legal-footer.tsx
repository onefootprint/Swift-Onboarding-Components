import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

const LegalFooter = () => (
  <StyledTypography>
    <Trans
      ns="identify"
      i18nKey="email-step.legal-footer"
      components={{
        termsLink: (
          <Link
            href="https://www.onefootprint.com/terms-of-service"
            rel="noopener noreferrer"
            target="_blank"
          />
        ),
        privacyPolicyLink: (
          <Link
            href="https://www.onefootprint.com/privacy-policy"
            rel="noopener noreferrer"
            target="_blank"
          />
        ),
      }}
    />
  </StyledTypography>
);

const StyledTypography = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('caption-2')}
    color: ${theme.color.tertiary};
    text-align: center;
    white-space: pre-wrap;
    line-height: 1.5;

    a {
      text-decoration: none;
      color: ${theme.color.accent};
    }
  `}
`;

export default LegalFooter;
