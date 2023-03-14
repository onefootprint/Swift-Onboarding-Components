import { useTranslation } from '@onefootprint/hooks';
import { Banner } from '@onefootprint/ui';
import React from 'react';
import ContactForm from 'src/components/contact-form';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

const SandboxBanner = () => {
  const { t } = useTranslation('components.sandbox-banner');
  const { sandbox } = useOrgSession();

  return sandbox.isSandbox ? (
    <SandboxBannerContainer>
      <Banner variant="warning">
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
          <ContactForm>{t('activate')}</ContactForm>
        )}
      </Banner>
    </SandboxBannerContainer>
  ) : null;
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};

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
