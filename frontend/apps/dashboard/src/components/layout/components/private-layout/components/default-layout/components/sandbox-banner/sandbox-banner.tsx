import { Banner, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from 'src/components/contact-form';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

const SandboxBanner = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.sandbox-banner',
  });
  const { sandbox } = useOrgSession();

  return sandbox.isSandbox ? (
    <SandboxBannerContainer>
      <StyledBanner variant="warning">
        {t('title')}
        {sandbox.canToggle ? (
          <button
            type="button"
            onClick={sandbox.toggle}
            disabled={!sandbox.canToggle}
          >
            {t('toggle')}
          </button>
        ) : (
          <>
            <Link href="mailto:eli@onefootprint.com">
              <button type="button">{t('contact-us')}</button>
            </Link>
            <Text variant="body-2" color="warning" sx={{ marginLeft: 2 }}>
              {t('or')}
            </Text>
            <ContactForm>{t('form')}</ContactForm>
            <Text variant="body-2" color="warning">
              .
            </Text>
          </>
        )}
      </StyledBanner>
    </SandboxBannerContainer>
  ) : null;
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;

    button {
      padding: 0;
      margin-left: ${theme.spacing[2]};

      &:disabled {
        cursor: default;
        opacity: 0.7;
      }
    }
  `};
`;

const StyledBanner = styled(Banner)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[1]};
  `};
`;

export default SandboxBanner;
