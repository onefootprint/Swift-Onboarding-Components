import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { BottomSheet, Button, Checkbox, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import { HeaderTitle } from '../../../../../../components';
import useIdDocMachine from '../../../../hooks/use-id-doc-machine';
import useConsent from './hooks/use-consent';

type SelfieConsentProps = {
  open: boolean;
  onConsent: () => void;
  onClose: () => void;
};

const SelfieConsent = ({ open, onConsent, onClose }: SelfieConsentProps) => {
  const { t } = useTranslation('components.selfie-consent');
  const [state] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useRequestErrorToast();
  const [isThirdPartyConsented, setIsThirdPartyConsented] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleConsent = () => {
    if (!authToken || consentMutation.isLoading) {
      return;
    }

    const consentLanguages = [t('title'), t('subtitle')];

    if (isThirdPartyConsented) {
      consentLanguages.push(t('third-party-consent-text'));
    }
    consentLanguages.push(t('cta'));

    const consentLanguageText = consentLanguages.join(' ');

    consentMutation.mutate(
      { consentLanguageText, authToken },
      {
        onSuccess: () => {
          onConsent();
        },
        onError: requestErrorToast,
      },
    );
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 4 }}
      />
      <Button
        onClick={handleConsent}
        fullWidth
        sx={{ marginTop: 8, marginBottom: 7 }}
        loading={consentMutation.isLoading}
      >
        {t('continue')}
      </Button>
      <ThirdPartyConsent>
        <Checkbox
          onChange={() => setIsThirdPartyConsented(!isThirdPartyConsented)}
          id="third-party-consent"
          checked={isThirdPartyConsented}
        />
        <LabelContainer
          onClick={() => setIsThirdPartyConsented(!isThirdPartyConsented)}
        >
          <Typography as="label" variant="body-3" color="secondary">
            <Trans
              i18nKey="components.selfie-consent.third-party-consent"
              components={{
                a: (
                  <Link
                    href="https://www.onefootprint.com/privacy-policy"
                    rel="noopener noreferrer"
                    target="_blank"
                    style={{ textDecoration: 'underline', color: '#2D2D2D' }}
                  />
                ),
              }}
            />
          </Typography>
        </LabelContainer>
      </ThirdPartyConsent>
    </BottomSheet>
  );
};

const ThirdPartyConsent = styled.div`
  ${({ theme }) => css`
    display: flex;
    background-color: ${theme.backgroundColor.secondary};
    margin-left: calc(-1 * ${theme.spacing[5]});
    margin-right: calc(-1 * ${theme.spacing[5]});
    width: calc(100% + ${theme.spacing[8]});
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div``;

export default SelfieConsent;
