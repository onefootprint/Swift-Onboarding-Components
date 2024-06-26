import { Banner, Stack, Text } from '@onefootprint/ui';
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
        <Stack direction="row" align="center" justify="center">
          <span>{t('title')}</span>
          {sandbox.canToggle ? (
            <button type="button" onClick={sandbox.toggle} disabled={!sandbox.canToggle}>
              {t('toggle')}
            </button>
          ) : (
            <>
              <Stack direction="row" gap={2} marginLeft={2}>
                <span>{t('to-activate')}</span>
                <Link href="mailto:eli@onefootprint.com">
                  <button type="button">{t('contact-us')}</button>
                </Link>
                <span color="warning">{t('or')}</span>
                <ContactForm>{t('form')}</ContactForm>
              </Stack>
              <span color="warning">.</span>
            </>
          )}
        </Stack>
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
