import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Checkbox, Divider, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import useIdDocMachine from '../../../../hooks/use-id-doc-machine';
import ConsentBottomSheet from './components/consent-bottomsheet/consent-bottomsheet';
import useConsent from './hooks/use-consent';

type ImageConsentProps = {
  open: boolean;
  onConsent: () => void;
  onClose: () => void;
};

const ImageConsent = ({ open, onConsent, onClose }: ImageConsentProps) => {
  const { t } = useTranslation('components.id-doc-photo-prompt.image-consent');
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

    // We remove the hyperlink tags for privacy policy and terms of service; example: "<privacy>Privacy Policy</privacy>" => "Privacy Policy"
    const descriptionWithoutHyperlinks = t('description')
      .replace('<privacy>', '')
      .replace('</privacy>', '')
      .replace('<toc>', '')
      .replace('</toc>', '')
      .replace('<br/>', '');
    const consentLanguages = [t('subtitle'), descriptionWithoutHyperlinks];

    if (isThirdPartyConsented) {
      consentLanguages.push(t('third-party-consent'));
    }
    consentLanguages.push(t('cta'));

    const consentLanguageText = consentLanguages.join('. ');

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
    <ConsentBottomSheet
      open={open}
      onClose={handleClose}
      onComplete={handleConsent}
      isLoading={consentMutation.isLoading}
    >
      <Typography
        variant="heading-3"
        sx={{ marginBottom: 4, textAlign: 'center' }}
      >
        {t('title')}
      </Typography>
      <Typography
        variant="label-3"
        sx={{ marginBottom: 4, textAlign: 'center' }}
      >
        {t('subtitle')}
      </Typography>
      <Typography variant="body-4" color="secondary" sx={{ marginBottom: 5 }}>
        <Trans
          i18nKey="components.id-doc-photo-prompt.image-consent.description"
          components={{
            privacy: (
              <Link
                href="https://www.onefootprint.com/privacy-policy"
                rel="noopener noreferrer"
                target="_blank"
                style={{ textDecoration: 'underline', color: '#2D2D2D' }}
              />
            ),
            toc: (
              <Link
                href="https://www.onefootprint.com/terms-of-service"
                rel="noopener noreferrer"
                target="_blank"
                style={{ textDecoration: 'underline', color: '#2D2D2D' }}
              />
            ),
          }}
        />
      </Typography>
      <Divider />
      <ThirdPartyConsent>
        <Checkbox
          onChange={() => setIsThirdPartyConsented(!isThirdPartyConsented)}
          id="third-party-consent"
          checked={isThirdPartyConsented}
        />
        <LabelContainer
          onClick={() => setIsThirdPartyConsented(!isThirdPartyConsented)}
        >
          <Typography variant="body-4" color="secondary">
            {t('third-party-consent')}
          </Typography>
        </LabelContainer>
      </ThirdPartyConsent>
    </ConsentBottomSheet>
  );
};

const ThirdPartyConsent = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin-left: calc(-1 * ${theme.spacing[5]});
    margin-right: calc(-1 * ${theme.spacing[5]});
    width: calc(100% + ${theme.spacing[8]});
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div``;

export default ImageConsent;
