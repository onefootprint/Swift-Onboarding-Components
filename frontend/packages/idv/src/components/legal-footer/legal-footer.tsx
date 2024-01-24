import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

type LegalFooterProps = { descriptionKey: string };

const LegalFooter = ({ descriptionKey }: LegalFooterProps) => (
  <StyledTypography>
    <Trans
      ns="idv"
      // @ts-ignore:next-line
      i18nKey={descriptionKey}
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
