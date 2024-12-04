import { Banner, Stack } from '@onefootprint/ui';
import Link from 'next/link';
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
      <Banner variant="warning" className="flex items-center justify-center gap-0.5">
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
      </Banner>
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

export default SandboxBanner;
