import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Checkbox, Divider, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';

import { HeaderTitle } from '../../../../components';

export type ImageConsentHandler = {
  getConsentInfo: () => { consentLanguageText: string; mlConsent: boolean };
};

const ImageConsent = forwardRef<ImageConsentHandler, {}>((props, ref) => {
  const { t } = useTranslation('components.image-consent');
  const [isThirdPartyConsented, setIsThirdPartyConsented] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      getConsentInfo: () => {
        const descriptionWithoutHyperlinks = t('description')
          .replaceAll('<privacy>', '')
          .replaceAll('</privacy>', '')
          .replaceAll('<toc>', '')
          .replaceAll('</toc>', '')
          .replaceAll('<br/>', '');
        const consentLanguages = [t('subtitle'), descriptionWithoutHyperlinks];

        if (isThirdPartyConsented) {
          consentLanguages.push(t('third-party-consent'));
        }
        consentLanguages.push(t('cta'));

        const consentLanguageText = consentLanguages.join('. ');
        return { consentLanguageText, mlConsent: isThirdPartyConsented };
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isThirdPartyConsented],
  );

  const handleThirdPartyConsent = () => {
    setIsThirdPartyConsented(prev => !prev);
  };

  const linkStyle = { textDecoration: 'underline', color: '#2D2D2D' };

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 5 }}
      />
      <Typography variant="body-4" color="secondary" sx={{ marginBottom: 5 }}>
        <Trans
          i18nKey="components.image-consent.description"
          components={{
            privacy: (
              <Link
                href="https://www.onefootprint.com/privacy-policy"
                rel="noopener noreferrer"
                target="_blank"
                style={linkStyle}
              />
            ),
            toc: (
              <Link
                href="https://www.onefootprint.com/terms-of-service"
                rel="noopener noreferrer"
                target="_blank"
                style={linkStyle}
              />
            ),
          }}
        />
      </Typography>
      <Divider />
      <ThirdPartyConsent>
        <Checkbox
          onChange={handleThirdPartyConsent}
          id="third-party-consent"
          testID="third-party-consent"
          checked={isThirdPartyConsented}
        />
        <LabelContainer onClick={handleThirdPartyConsent}>
          <Typography variant="body-4" color="secondary">
            {t('third-party-consent')}
          </Typography>
        </LabelContainer>
      </ThirdPartyConsent>
    </>
  );
});

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
